import re
from datetime import timedelta

from decks.models import Deck, FlashCard, SharedDeck
from decks.serializers import (DeckSerializer, FlashCardSerializer,
                               SharedDeckSerializer)
from django.db.models.query_utils import Q
from django.utils import timezone
from profiles.models import Profile
from profiles.serializers import HistorySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Assignment, AssignmentStudySessionManager, Classroom
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classrooms_homepage_view(request, *args, **kwargs):
    """
    Gets a list of classrooms the current user is a teacher of - POST
    """
    classrooms = request.user.profile.classrooms_taught.order_by('title')

    return Response(ClassroomSerializer(classrooms, many=True).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_classroom_view(request, *args, **kwargs):
    """
    Edits a classroom - POST

    Required information:
        `classroom_id`: (Data) Id of the classroom to edit
        `new_title`: (Data) New title for the classroom
    """
    try:
        classroom = Classroom.objects.get(
            teachers=request.user.profile,
            pk=request.data.get('classroom_id'),
        )
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    classroom.title = request.data.get('new_title', classroom.title)
    classroom.save()

    return Response(ClassroomSerializer(classroom).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_classroom_view(request, *args, **kwargs):
    """
    Deletes a classroom - POST

    Required information:
        `classroom_id`: (Data) Id of the classroom to delete
    """
    try:
        classroom = Classroom.objects.get(
            teachers=request.user.profile,
            pk=request.data.get('classroom_id'),
        )
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    classroom.delete()
    return Response(ClassroomSerializer(classroom).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_join_class_view(request, *args, **kwargs):
    """
    Allows a student (current user) to join a class with a given code - POST

    Required information:
        `classroom_code`: (Data) Code of the class to join
    """
    try:
        classroom = Classroom.objects.get(code=request.data.get('classroom_code'))
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
def student_joined_classes_view(request, *args, **kwargs):
    """
    Gets the list of classes a student has joined - GET
    """
    classrooms = request.user.profile.classrooms_in.order_by('title')

    return Response(ClassroomSerializer(classrooms, many=True).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_detail_view(request, classroom_id, *args, **kwargs):
    """
    Gets basic information about a classroom - GET

    Required information:
        `classroom_id`: (GET) Id of the classroom to get information about
    """
    classroom = Classroom.objects.filter(
        Q(pk=classroom_id) & (Q(teachers=request.user.profile) | Q(students=request.user.profile))
    ).first()  # we use .filter instead of .get, because this sometimes returns multiple classrooms

    if classroom is None:
        return Response({'message': 'Classroom not found'}, status=404)

    return Response(ClassroomSerializer(classroom).data, status=200)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_attach_deck_view(request, classroom_id, *args, **kwargs):
    """
    Allows a teacher to attache a deck to a classroom - POST

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

    return Response(SharedDeckSerializer(shared_deck).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_statistics_view(request, classroom_id, student_id, *args, **kwargs):
    """
    Gets statistics about a student for teachers - GET

    Required information:
        `classroom_id`: (URL) Id of the classroom the student is currently in
        `student_id`: (URL) Id of the student Profile to get data for
    """
    try:
        # We need .filter instead of .get because of edge-cases when the teacher
        # teaches multiple classes the student is in
        student = Profile.objects.filter(
            pk=student_id,
            classrooms_in__teachers=request.user.profile,
        ).first()
    except Profile.DoesNotExist:
        return Response({'message': 'Student not found'}, status=404)

    try:
        classroom = Classroom.objects.get(teachers=request.user.profile, pk=classroom_id)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    # Get the deck that the student copied
    student_copied_deck = student.user.decks.filter(student_attached_to=classroom).first()
    if student_copied_deck is None:
        return Response({'message': 'Student deck not found'}, status=404)

    # Get statistics about the deck and student
    deck_stats = student_copied_deck.get_statistics()
    cutoff_time = timezone.now() - timedelta(days=182)  # half a year, and about school year length
    student_history = student.history.filter(date__gte=cutoff_time)

    stats = {
        'deck_stats': deck_stats,
        'student_history': HistorySerializer(student_history, many=True).data,
    }

    return Response(stats, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_attach_deck_view(request, classroom_id, *args, **kwargs):
    """
    Allows a student to attach a deck to a classroom - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom to attach to
        `deck_id`: (Data) Id of the deck to attach
    """
    # Get classroom and origin deck specified
    try:
        classroom = Classroom.objects.get(pk=classroom_id, students=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    try:
        deck = Deck.objects.get(pk=request.data.get('deck_id'), user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Attach the deck
    if deck.student_attached_to is None:
        deck.student_attached_to = classroom
        deck.save()
    else:
        return Response({'You\'ve already attached a deck'}, status=400)

    return Response({'message': 'Deck attached'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_get_attached_deck_view(request, classroom_id, student_id, *args, **kwargs):
    """
    Allows a student to attach a deck to a classroom - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom to attach to
        `student_id`: (URL) Id of the student to get the deck from
    """
    # Get classroom and origin deck specified
    try:
        classroom = Classroom.objects.get(pk=classroom_id, students=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    try:
        student = Profile.objects.get(pk=student_id, user=request.user)
    except Profile.DoesNotExist:
        return Response({'message': 'Student not found'}, status=404)

    student_attached_deck = student.user.decks.filter(student_attached_to=classroom).first()
    if student_attached_deck:
        # Returns None otherwise
        student_attached_deck = DeckSerializer(student_attached_deck).data

    return Response(student_attached_deck, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suspend_students_flashcards_view(request, classroom_id: int):
    """
    Allows a teacher to suspend certain flashcards in a student's deck - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom to attach to
        `tag_query`: (Data) Query with which to search tags
        `action`: (Data) Whether to SUSPEND or UNSUSPEND the flashcards
    """
    # Get classroom and tags query
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    tags_query = request.data.get('tag_query')
    action = request.data.get('action', 'SUSPEND')
    if tags_query is None:
        return Response({'message': 'You must specify a tags query'}, status=400)

    # Get flashcards to suspend
    query = Q(creator__deck__student_attached_to=classroom)
    query &= FlashCard.search_tags(tags_query)
    flashcards = FlashCard.objects.filter(query)

    # Suspend flashcards
    flashcards.update(is_suspended=action == 'SUSPEND')

    return Response({'message': 'Suspended flashcards', 'count': flashcards.count()}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_assignment_view(request, classroom_id: int):
    """
    Allows a teacher to suspend certain flashcards in a student's deck - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom to create an assignment in
        `title`: (Data) Title of the assignment
        `tag_query`: (Data) Query for the assignment
        `due_date`: (Data) ISO string of the due date for the assignment
    """
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    title = request.data.get('title')
    tag_query = request.data.get('tag_query')
    due_date = request.data.get('due_date')
    create_essential_copy = request.data.get('create_essential_copy', False)
    if None in (title, tag_query, due_date):
        return Response(
            {'message': 'You must specify `title`, `tag_query`, and `due_date`'},
            status=400,
        )

    assignments = [
        Assignment(
            title=title,
            classroom=classroom,
            tag_query=tag_query,
            due_date=due_date,
        )
    ]
    if create_essential_copy:
        assignments.append(
            Assignment(
                title=f'{title} (Essential Only)',
                classroom=classroom,
                tag_query=f'{tag_query} AND essential',
                due_date=due_date,
            )
        )
    Assignment.objects.bulk_create(assignments)

    return Response({'message': 'Created assignment'}, status=201)


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
def assignments_student_list_view(request):
    """
    Lists all of the classes, and their assignments, for a student - GET
    """
    classrooms = Classroom.objects.filter(
        students=request.user.profile
    ).prefetch_related('assignments').order_by('title')

    return Response(
        ClassroomAssignmentsSerializer(
            classrooms,
            many=True,
            context={'calc_percent_complete': True, 'request': request}
        ).data,
        status=200,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_assignment_view(request, classroom_id: int, assignment_id: int):
    """
    Allows a teacher to edit an assignment - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom that has the assignment
        `assignment_id`: (URL) Id of the assignment to delete
        `new_title`: (Data) New title of the assignment
        `new_tag_query`: (Data) New tag query for the assignment
        `new_due_date`: (Data) New due date for the assignment
    """
    try:
        assignment = Assignment.objects.get(
            pk=assignment_id,
            classroom__teachers=request.user.profile,
        )
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)

    assignment.title = request.data.get('new_title', assignment.title)
    assignment.tag_query = request.data.get('new_tag_query', assignment.tag_query)
    assignment.due_date = request.data.get('new_due_date', assignment.due_date)
    assignment.save()

    return Response({'message': 'Edited assignment'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_assignment_view(request, classroom_id: int, assignment_id: int):
    """
    Allows a teacher to delete an assignment - POST

    Required information:
        `classroom_id`: (URL) Id of the classroom that has the assignment
        `assignment_id`: (URL) Id of the assignment to delete
    """
    try:
        Assignment.objects.get(
            pk=assignment_id,
            classroom__teachers=request.user.profile,
        ).delete()
        return Response({'message': 'Deleted assignment'})
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_percent_complete_list(request, classroom_id: int, assignment_id: int):
    """
    Allows a teacher to get the percent complete for each student - GET

    Parameters:
        `classroom_id`: (URL) Id of the classroom that has the assignment
        `assignment_id`: (URL) Id of the assignment to get percent completes for
    """
    try:
        assignment = Assignment.objects.get(
            pk=assignment_id,
            classroom__teachers=request.user.profile,
        )
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)

    student_data = [
        {
            'name': f'{student.user.first_name} {student.user.last_name}',
            'percent_complete': assignment.calc_percent_complete(student.user),
            'id': student.pk,
        }
        for student in assignment.classroom.students.all().prefetch_related('user')
    ]

    return Response(student_data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def study_assignment_view(request, classroom_id: int, assignment_id: int):
    """
    Gets the flashcards to study for a given assignment - GET

    Parameters:
        `classroom_id`: (URL) Id of the classroom that has the assignment
        `assignment_id`: (URL) Id of the assignment to get flashcards of
    """
    try:
        assignment = Assignment.objects.get(
            pk=assignment_id,
            classroom__students=request.user.profile,
        )
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)

    assm, created = AssignmentStudySessionManager.objects.get_or_create(
        assignment=assignment,
        user=request.user.profile,
    )

    # If there are any updates available, pull them
    attached_deck = assm.get_attached_deck()  # type: Deck
    if attached_deck:
        needs_updating = attached_deck.list_available_updates()
        if len(needs_updating) > 0:
            for update in needs_updating:
                classroom_deck = SharedDeck.objects.get(pk=update['id'])
                attached_deck.pull_updates(classroom_deck)

    # Get the flashcards
    seen_flashcards, unseen_flashcards = assm.get_flashcards()
    flashcards = assm.get_reviews(seen_flashcards, unseen_flashcards)

    return Response(
        FlashCardSerializer(flashcards, many=True).data,
        status=200,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignment_detail_view(request, classroom_id: int, assignment_id: int):
    """
    Gets the flashcards to study for a given assignment - GET

    Parameters:
        `classroom_id`: (URL) Id of the classroom that has the assignment
        `assignment_id`: (URL) Id of the assignment to get
    """
    try:
        assignment = Assignment.objects.get(
            Q(pk=assignment_id) & (
                Q(classroom__students=request.user.profile) |
                Q(classroom__teachers=request.user.profile)
            )
        )
    except Assignment.DoesNotExist:
        return Response({'message': 'Assignment not found'}, status=404)

    return Response(
        AssignmentSerializer(
            assignment,
            context={
                'request': request,
                'get_study_session_manager': True
            },
        ).data,
        status=200,
    )
