from datetime import timedelta
from django.utils import timezone
from profiles.serializers import HistorySerializer
from profiles.models import Profile
from django.db.models.query_utils import Q
from decks.serializers import DeckSerializer
from ..serializers import ClassroomSerializer, StudentSerializer
from ..models import Classroom

from decks.models import Deck
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


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
    allowed_chars = 'bcdfghjkmpqrtvwxyBCDFGHJKMPQRTVWXY346789-_'
    while True:
        classroom_code = get_random_string(8, allowed_chars)
        try:
            Classroom.objects.get(code=classroom_code)
        except Classroom.DoesNotExist:
            break

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
        classroom = Classroom.objects.get(teachers=request.user.profile, pk=request.data.get('classroom_id'))
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
        classroom = Classroom.objects.get(teachers=request.user.profile, pk=request.data.get('classroom_id'))
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
    # TODO: a skilled user could technically spam this with requests to join random classes
    try:
        classroom = Classroom.objects.get(code=request.data.get('classroom_code'))
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

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
    try:
        classroom = Classroom.objects.get(
            Q(pk=classroom_id) & (Q(teachers=request.user.profile) | Q(students=request.user.profile))
        )
    except Classroom.DoesNotExist:
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
            StudentSerializer(classroom.students, many=True, context={'tz': request.GET.get('tz')}).data,
        status=200)


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

    # Create shared deck
    shared_deck = deck.create_shared_deck(
        deck.title,
        f'Deck for "{classroom.title}."  Students can copy and study this deck.',
        sharing_setting='STUDENT',
        include_copied_flashcards=True,
    )

    # Attach the deck
    classroom.deck = shared_deck
    classroom.save()

    return Response(DeckSerializer(deck).data, status=200)


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
        student = Profile.objects.get(pk=student_id, classrooms_in__teachers=request.user.profile)
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
    cutoff_time = timezone.now() - timedelta(days=182) # half a year, and about school year length
    student_history = student.history.filter(date__gte=cutoff_time)

    stats ={
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
    # TODO: make it so this can only happen if they haven't already attached a deck (and same for cloning?)
    deck.student_attached_to = classroom
    deck.save()

    return Response(DeckSerializer(deck).data, status=200)


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
