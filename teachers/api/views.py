import re

from decks.models import Deck
from django.db.models.query_utils import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sharing_system.serializers import SharedDeckSerializer
from skill_tree.models import SubSection

from ..models import Assignment, Classroom
from ..serializers import (AssignmentSerializer,
                           ClassroomAssignmentsSerializer, ClassroomSerializer,
                           StudentSerializer)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_classroom_view(request, *args, **kwargs):
    """
    Creates a classroom with the current user as the teacher - POST

    Required information:
        `title`: (Data) Title of the class to create
    """
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'You must specify a title for your class'}, status=400)

    # Generate unique classroom code
    classroom_code = Classroom.generate_class_code()

    # Create
    classroom = Classroom.objects.create(
        title=title,
        code=classroom_code,
    )
    classroom.teachers.add(request.user.profile)

    return Response(ClassroomSerializer(classroom).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_join_class_view(request, *args, **kwargs):
    """
    Allows a student (current user) to join a class with a given code - POST

    Required information:
        `classroom_code`: (Data) Code of the class to join
    """
    try:
        classroom = Classroom.objects.get(code=request.data.get('classroom_code', '').strip())
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    # Check that the student and teacher have same email domain
    teacher_email_domain = re.search(r"@[\w.]+", classroom.teachers.first().user.email).group()
    student_email_domain = re.search(r"@[\w.]+", request.user.email).group()
    if teacher_email_domain != student_email_domain:
        return Response({'message': 'You may only join classes in the same domain'}, status=404)

    # Add student
    classroom.students.add(request.user.profile)

    return Response(ClassroomSerializer(classroom).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_detail_view(request, classroom_id, *args, **kwargs):
    """
    Gets basic information about a classroom - GET

    Required information:
        `classroom_id`: (GET) Id of the classroom to get information about
    """
    classroom = Classroom.objects.filter(
        Q(pk=classroom_id) &
        (Q(teachers=request.user.profile) | Q(students=request.user.profile))
    ).first()  # we use .filter instead of .get, because this sometimes returns multiple classrooms

    if classroom is None:
        return Response({'message': 'Classroom not found'}, status=404)

    return Response(ClassroomAssignmentsSerializer(classroom).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_students_view(request, classroom_id, *args, **kwargs):
    """
    Gets a list of students in a classroom - GET

    Required information:
        `classroom_id`: (URL) Id of the classroom to get information about
        `tz`: (GET) Timezone offset.  Used to determine when "today" is
    """
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    return Response(
        StudentSerializer(
            classroom.students,
            many=True,
            context={'tz': request.GET.get('tz')}
        ).data,
        status=200,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_percent_complete(request, classroom_id):
    assigned_sub_sections = SubSection.objects.filter(
        attached_assignments__classrooms__pk=classroom_id,
    ).values_list('universal_sub_section_id', flat=True)
    sub_sections = SubSection.objects.filter(
        main_section__deck__student_attached_to=classroom_id,
        main_section__deck__user_id=request.user.pk,
        universal_sub_section_id__in=assigned_sub_sections,
    )
    sub_sections_percent_complete = [
        {
            'id': sub_section.pk,
            'universal_sub_section_id': sub_section.universal_sub_section_id,
            'percent_complete': sub_section.get_percent_complete(),
            'total_percent_complete': sub_section.get_percent_complete(total=True),
        }
        for sub_section in sub_sections
    ]

    return Response(sub_sections_percent_complete, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_attach_deck_view(request, classroom_id, *args, **kwargs):
    """
    Allows a teacher to attach a deck to a classroom - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom to attach to
        `deck_id`: (Data) Id of the deck to attach
    """
    # Get classroom and origin deck specified
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    try:
        deck = Deck.objects.get(pk=request.data.get('deck_id'), user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    shared_deck = classroom.attach_deck(deck)

    return Response(
        SharedDeckSerializer(
            shared_deck,
            context={'get_personal_copy': True, 'request': request},
        ).data,
        status=200,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_assignment(request):
    """
    Allows a teacher to create an assignment for their classes

    Required information:
        `assignment_title`: (Data) Title of the assignment
        `classroom_ids`: (Data) Ids of the classrooms to create the assignment in
        `section_ids`: (Data) Ids of the sub sections to assign
        `essential_only`: (Data) Whether or not the assignment should only show essential cards
        # `due_date`: (Data) ISO string of the due date for the assignment
    """
    assignment_title = request.data.get('assignment_title')
    classroom_ids = request.data.get('classroom_ids')
    section_ids = request.data.get('section_ids')
    essential_only = request.data.get('essential_only')
    if None in (assignment_title, classroom_ids, section_ids, essential_only):
        return Response({'message': 'You must specify all arguments'}, status=400)

    classrooms = Classroom.objects.filter(
        pk__in=classroom_ids,
        teachers=request.user.profile,
    )
    if classrooms.count() != len(classroom_ids) or len(classroom_ids) == 0:
        return Response({'message': 'Classrooms not found'}, status=404)

    sub_sections = SubSection.objects.filter(
        pk__in=section_ids,
        main_section__snapshot__shared_deck__owners=request.user.profile,
    )
    if sub_sections.count() != len(section_ids) or len(section_ids) == 0:
        return Response({'message': 'Sub sections not found'}, status=404)

    assignment = Assignment.objects.create(
        title=assignment_title,
        essential_only=essential_only,
    )
    assignment.classrooms.set(classrooms)
    assignment.sub_sections.set(sub_sections)

    return Response(AssignmentSerializer(assignment).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classrooms_list(request, *args, **kwargs):
    if request.user.profile.settings.user_type == 'TEACHER':
        classrooms = request.user.profile.classrooms_taught.order_by('title')
    else:
        classrooms = request.user.profile.classrooms_in.order_by('title')

    return Response(ClassroomSerializer(classrooms, many=True).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignments_teacher_list_view(request, classroom_id: int):
    """
    Lists the assignments a teacher has created for their class - GET

    Required information:
        `classroom_id`: (URL) Id of the classroom to get assignments for
    """
    try:
        classroom = Classroom.objects.get(teachers=request.user.profile, pk=classroom_id)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    assignments = classroom.assignments.all()

    return Response(AssignmentSerializer(assignments, many=True).data, 200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignment_percent_complete(request, classroom_id: int, assignment_id: int):
    try:
        classroom = Classroom.objects.get(pk=classroom_id)
        if not classroom.teachers.filter(user=request.user).exists():
            raise Assignment.DoesNotExist
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    try:
        assignment = Assignment.objects.get(pk=assignment_id)
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)

    # NOTE: It is more efficient to do this once, rather than recalculating for each student
    assigned_sub_sections_uids = assignment.sub_sections.values_list(
        'universal_sub_section_id',
        flat=True,
    )

    student_data = [
        {
            'username': student.user.username,
            'first_name': student.user.first_name,
            'last_name': student.user.last_name,
            'percent_complete': assignment.calc_percent_complete(
                student.user,
                assigned_sub_sections_uids,
            ),
        }
        for student in classroom.students.prefetch_related('user').all()
    ]

    return Response(student_data, status=200)
