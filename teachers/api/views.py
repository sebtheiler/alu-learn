from ..serializers import ClassroomSerializer, StudentSerializer
from ..models import Classroom

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
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    return Response(ClassroomSerializer(classroom).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_students_view(request, classroom_id, *args, **kwargs):
    """
    Gets a list of students in a classroom - GET

    Required information:
        `classroom_id`: (GET) Id of the classroom to get information about
    """
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    return Response(StudentSerializer(classroom.students, many=True).data, status=200)