from rest_framework.decorators import api_view, permission_classes

from ..models import Routine, Habit
from ..serializers import RoutineSerializer, HabitSerializer
from django.db.models import F
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
        routine_num=Routine.get_routine_num(request.user.profile),
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

    # Slide down all routines after this routine
    routines_to_move = Routine.objects.filter(routine_num__gt=routine.routine_num)
    routines_to_move.update(routine_num=F('routine_num') - 1)

    return Response({'message': 'Deleted routine'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def routine_rearrange(request, routine_id, *args, **kwargs):
    """
    Rearranges a routine - POST

    Params:
        `direction`: "UP" _decrements_ routine_num, "DOWN" _increments_ routine_num
    """
    direction = request.data.get('direction')
    if direction is None:
        return Response({'message': 'You must specify `direction`'}, status=400)

    routine = Routine.objects.get(pk=routine_id, user=request.user.profile)
    if direction == 'UP':
        if routine.routine_num == 0:
            return Response({'message': 'Routine is already at the top'}, status=400)

        other_routine = Routine.objects.get(
            routine_num=routine.routine_num - 1,
            user=request.user.profile,
        )
        routine.routine_num -= 1
        other_routine.routine_num += 1
    elif direction == 'DOWN':
        if routine.routine_num == Routine.get_routine_num(request.user.profile) - 1:
            return Response({'message': 'Routine is already at the bottom'}, status=400)

        other_routine = Routine.objects.get(
            routine_num=routine.routine_num + 1,
            user=request.user.profile,
        )
        routine.routine_num += 1
        other_routine.routine_num -= 1
    else:
        return Response({'message': 'Unrecognized `direction`'}, status=400)

    Routine.objects.bulk_update([routine, other_routine], ['routine_num'])

    return Response({'message': 'Rearranged routine'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_create(request, routine_id, *args, **kwargs):
    """
    Creates a habit - POST

    Params:
        `title`
        `cue`
        `craving`
        `response`
        `reward`
        `notes`
        `value`
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
        notes=request.data.get('notes', ''),
        value=request.data.get('value', 'NEUTRAL'),
        habit_num=routine.get_habit_num(),
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

    history = request.data.get('new_history')
    if isinstance(history, list):
        habit.history = history

    habit.title = title or habit.title
    habit.cue = request.data.get('new_cue') or habit.cue
    habit.craving = request.data.get('new_craving') or habit.craving
    habit.response = request.data.get('new_response') or habit.response
    habit.reward = request.data.get('new_reward') or habit.reward
    habit.notes = request.data.get('new_notes') or habit.notes
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

    # Slide down all routines after this routine
    habits_to_move = Habit.objects.filter(habit_num__gt=habit.habit_num)
    habits_to_move.update(habit_num=F('habit_num') - 1)

    return Response({'message': 'Deleted habit'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_rearrange(request, routine_id, habit_id, *args, **kwargs):
    """
    Rearranges a habit - POST

    Params:
        `direction`: "UP" _decrements_ habit_num, "DOWN" _increments_ habit_num
    """
    direction = request.data.get('direction')
    if direction is None:
        return Response({'message': 'You must specify `direction`'}, status=400)

    routine = Routine.objects.get(pk=routine_id, user=request.user.profile)
    habit = Habit.objects.get(pk=habit_id, routine=routine)
    if direction == 'UP':
        if habit.habit_num == 0:
            return Response({'message': 'Habit is already at the top'}, status=400)

        other_habit = Habit.objects.get(
            habit_num=habit.habit_num - 1,
            routine=routine,
        )
        habit.habit_num -= 1
        other_habit.habit_num += 1
    elif direction == 'DOWN':
        if habit.habit_num == habit.routine.get_habit_num() - 1:
            return Response({'message': 'habit is already at the bottom'}, status=400)

        other_habit = Habit.objects.get(
            habit_num=habit.habit_num + 1,
            routine=routine,
        )
        habit.habit_num += 1
        other_habit.habit_num -= 1
    else:
        return Response({'message': 'Unrecognized `direction`'}, status=400)

    Habit.objects.bulk_update([habit, other_habit], ['habit_num'])

    return Response({'message': 'Rearranged habit'}, status=200)
