from teachers.serializers import ClassroomSerializer
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
        classroom = Classroom.objects.get(user=request.user.profile, pk=request.data.get('classroom_id'))
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
        classroom = Classroom.objects.get(user=request.user.profile, pk=request.data.get('classroom_id'))
    except Classroom.DoesNotExist:
        return Response({'message': 'Classroom not found'}, status=404)

    classroom.delete()
    return Response(ClassroomSerializer(classroom).data, status=200)
