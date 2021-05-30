from rest_framework.decorators import api_view, permission_classes

from ..models import Routine, Habit
from ..serializers import RoutineSerializer, HabitSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def routine_create(request, *args, **kwargs):
    """
    Creates a new routine - POST

    Params:
        title: str = Title of the new routine
        ordered: bool = Whether or not the new routine is ordered
    """
    title = request.data.get('title')
    ordered = request.data.get('ordered')
    if title is None or ordered is None:
        return Response({'message': '`title` and `ordered` must not be None'}, status=400)

    routine = Routine.objects.create(
        user=request.user.profile,
        title=title,
        ordered=ordered,
    )

    return Response(RoutineSerializer(routine).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def routine_list(request, *args, **kwargs):
    """
    Gets a list of the current users' routines - GET
    """
    routines = Routine.objects.filter(user=request.user.profile)
    return Response(RoutineSerializer(routines, many=True).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def routine_edit(request, routine_id, *args, **kwargs):
    """
    Edits a routine - POST
    """
    routine = Routine.objects.get(pk=routine_id, user=request.user.profile)
    routine.title = request.data.get('new_title') or routine.title
    routine.ordered = request.data.get('new_ordered') or routine.ordered
    routine.save()

    return Response(RoutineSerializer(routine).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def routine_delete(request, routine_id, *args, **kwargs):
    """
    Deletes a routine - POST
    """
    routine = Routine.objects.get(pk=routine_id, user=request.user.profile)
    routine.delete()

    return Response({'message': 'Deleted routine'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_create(request, routine_id, *args, **kwargs):
    """
    Creates a habit - POST
    """
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'You must specify a `title`'}, status=400)

    routine = Routine.objects.get(pk=routine_id, user=request.user.profile)
    habit = Habit.objects.create(
        routine=routine,
        title=title,
        cue=request.data.get('cue', ''),
        craving=request.data.get('craving', ''),
        response=request.data.get('response', ''),
        reward=request.data.get('reward', ''),
        value=request.data.get('value', 'NEUTRAL'),
    )

    return Response(HabitSerializer(habit).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_edit(request, routine_id, habit_id, *args, **kwargs):
    """
    Edits a habit - POST
    """
    habit = Habit.objects.get(pk=habit_id, routine__user=request.user.profile)

    title = request.data.get('new_title')
    if title and len(title) == 0:
        title = None

    habit.title = title or habit.title
    habit.cue = request.data.get('new_cue') or habit.cue
    habit.craving = request.data.get('new_craving') or habit.craving
    habit.response = request.data.get('new_response') or habit.response
    habit.reward = request.data.get('new_reward') or habit.reward
    habit.value = request.data.get('new_value') or habit.value
    habit.save()

    return Response(HabitSerializer(habit).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_delete(request, routine_id, habit_id, *args, **kwargs):
    """
    Deletes a habit - POST
    """
    habit = Habit.objects.get(pk=habit_id, routine__user=request.user.profile)
    habit.delete()

    return Response({'message': 'Deleted habit'}, status=200)
