import re
from datetime import timedelta

from decks.models import Deck, ReviewInstance
from decks.serializers import DeckSerializer
from django.db.models.query_utils import Q
from django.utils import timezone
from profiles.models import Profile
from profiles.serializers import HistorySerializer
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


# TODO: delete this?
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
    query = Q(flashcard__deck__student_attached_to=classroom)
    query &= ReviewInstance.search_tags(tags_query)
    flashcards = ReviewInstance.objects.filter(query).prefetch_related('flashcard')

    # Suspend flashcards
    flashcards.update(is_suspended=action == 'SUSPEND')

    return Response({'message': 'Suspended flashcards', 'count': flashcards.count()}, status=200)


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


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def study_assignment_view(request, classroom_id: int, assignment_id: int):
#     """
#     Gets the flashcards to study for a given assignment - GET

#     Parameters:
#         `classroom_id`: (URL) Id of the classroom that has the assignment
#         `assignment_id`: (URL) Id of the assignment to get flashcards of
#     """
#     try:
#         assignment = Assignment.objects.get(
#             pk=assignment_id,
#             classroom__students=request.user.profile,
#         )
#     except Assignment.DoesNotExist:
#         return Response({'message': 'Assignment not found'}, status=404)

#     try:
#         assm = AssignmentStudySessionManager.objects.get(
#             assignment=assignment,
#             user=request.user.profile,
#         )
#     except AssignmentStudySessionManager.DoesNotExist:
#         # Get default SSM values from the copied deck SSM
#         classroom = Classroom.objects.get(pk=classroom_id)
#         deck = classroom.get_student_copied_deck(request.user)

#         if deck is not None:
#             ssm = deck.study_session_manager
#             defaults = {
#                 'scheduling_algorithm': ssm.scheduling_algorithm,
#                 'shuffle_unseen_cards': ssm.shuffle_unseen_cards,
#                 'review_ahead_minutes': ssm.review_ahead_minutes,
#                 'daily_new_card_limit': ssm.daily_new_card_limit,
#                 'daily_seen_card_limit': ssm.daily_seen_card_limit,
#                 'difficulty': ssm.difficulty,
#             }
#         else:
#             defaults = {}

#         assm = AssignmentStudySessionManager.objects.create(
#             assignment=assignment,
#             user=request.user.profile,
#             **defaults
#         )  # type: AssignmentStudySessionManager

#     # If there are any updates available, pull them
#     attached_deck = assm.get_attached_deck()
#     if attached_deck:
#         needs_updating = attached_deck.list_available_updates()
#         if len(needs_updating) > 0:
#             try:
#                 for update in needs_updating:
#                     classroom_deck = SharedDeck.objects.get(pk=update['id'])
#                     attached_deck.pull_updates(classroom_deck)
#             except ValueError:
#                 return Response({
#                     'message': 'Deck is already updating. Please try again in a few seconds.'
#                 }, status=400)

#     # Get the flashcards
#     seen_flashcards, unseen_flashcards = assm.get_flashcards()
#     reviews = assm.get_reviews(
#         seen_flashcards,
#         unseen_flashcards,
#         request.GET.get('from_overflow_bucket') == 'true',
#     )

#     return Response({
#         'flashcards': ReviewInstanceSerializer(reviews['flashcards'], many=True).data,
#         'num_overflow': reviews['num_overflow'],
#     }, status=200)


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


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def classroom_get_ssm_view(request, classroom_id):
#     """
#     Gets the SSM the current user has for the deck that is copied from this class - GET
#     If the user hasn't copied the class deck yet, it copies the deck automatically
#     Fails if the classroom has no attached deck

#     Params:
#         `classroom_id`: (GET) Id of the classroom to get the SSM from
#     """
#     try:
#         classroom = Classroom.objects.get(
#             pk=classroom_id,
#             students=request.user.profile,
#         )
#     except Classroom.DoesNotExist:
#         return Response({'message': 'Classroom not found'}, status=404)

#     try:
#         deck = classroom.get_student_copied_deck(request.user, True)
#     except AttributeError:
#         return Response({'message': 'Classroom has no attached deck'}, status=400)
#     ssm = deck.study_session_manager

#     return Response(StudySessionManagerSerializer(ssm).data, status=200)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def classroom_edit_ssm_view(request, classroom_id):
#     """
#     Edits the SSM of the deck a student attached to classroom, as well
#     as the ASSMs for all of the assignments in the class - POST

#     Params:
#         `daily_new_card_limit`? (Data)
#         `daily_seen_card_limit`? (Data)
#         `shuffle_unseen_cards`? (Data)
#         `review_ahead_minutes`? (Data)
#         `scheduling_algorithm`? (Data)
#     """
#     try:
#         ssm = DeckStudySessionManager.objects.get(
#             user=request.user.profile,
#             deck__student_attached_to__pk=classroom_id,
#         )
#     except DeckStudySessionManager.DoesNotExist:
#         return Response({'message': 'DeckStudySessionManager not found'}, status=404)

#     # Edit DSSM
#     ssm.scheduling_algorithm = request.data.get('scheduling_algorithm', ssm.scheduling_algorithm)
#     ssm.daily_new_card_limit = request.data.get('daily_new_card_limit', ssm.daily_new_card_limit)
#     ssm.daily_seen_card_limit = request.data.get(
#         'daily_seen_card_limit',
#         ssm.daily_seen_card_limit,
#     )
#     ssm.review_ahead_minutes = request.data.get('review_ahead_minutes', ssm.review_ahead_minutes)
#     ssm.shuffle_unseen_cards = request.data.get('shuffle_unseen_cards', ssm.shuffle_unseen_cards)
#     ssm.save()

#     # Find and edit any available ASSMs
#     assms = AssignmentStudySessionManager.objects.filter(
#         user=request.user.profile,
#         assignment__classroom__pk=classroom_id,
#     )
#     assms.update(
#         scheduling_algorithm=request.data.get('scheduling_algorithm', ssm.scheduling_algorithm),
#         daily_new_card_limit=request.data.get('daily_new_card_limit', ssm.daily_new_card_limit),
#       daily_seen_card_limit=request.data.get('daily_seen_card_limit', ssm.daily_seen_card_limit),
#         review_ahead_minutes=request.data.get('review_ahead_minutes', ssm.review_ahead_minutes),
#         shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', ssm.shuffle_unseen_cards),
#     )

#     return Response({'message': 'Edited DSSM and any ASSMs available'}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classrooms_list(request, *args, **kwargs):
    if request.user.profile.settings.user_type == 'TEACHER':
        classrooms = request.user.profile.classrooms_taught.order_by('title')
    else:
        classrooms = request.user.profile.classrooms_in.order_by('title')

    return Response(ClassroomSerializer(classrooms, many=True).data, status=200)
