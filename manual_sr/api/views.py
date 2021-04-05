from utils import get_paginated_queryset_response, BLANK_SLATE_ELEMENT
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import ManualSRTask
from ..serializers import ManualSRTaskSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_create_view(request, *args, **kwargs):
    """
    Creates a Manual SR Object - POST

    Required information:
        `title`: (Data) Title of the new SR Object
        `description`: (Data) SlateJS-JSON description of the new object

    Possible errors:
        Title is none: 400, Title must not be none
    """
    title = request.data.get('title')
    desc = request.data.get('description')
    if title is None:
        return Response({'message': 'Title must not be none'}, status=400)

    created_obj = ManualSRTask.objects.create(
        user=request.user.profile,
        title=title,
        description=desc if desc else BLANK_SLATE_ELEMENT,
    )

    return Response(ManualSRTaskSerializer(created_obj).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manual_sr_list_view(request, *args, **kwargs):
    """
    Get's all of the current user's Manual SR Objects (Paginated) - GET
    """
    return get_paginated_queryset_response(
        qs=request.user.profile.manual_sr_objects.all().order_by('next_review'),
        request=request,
        Serializer=ManualSRTaskSerializer,
        page_size=25,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_update_view(request, manual_sr_id, *args, **kwargs):
    """
    Update a manual SR task's review information - POST

    Required information:
        `manual_sr_id`: (URL) ID of the study session manager
        `next_review`: (Data) ISO string date for next review
        `learning_status`: (Data) Learning status of the card, either 'UNSEEN', 'LEARNING', 'LEARNED', or 'RELEARNING'
        `ease`: (Data) Ease of card
        `interval`: (Data) The new interval for the flashcard

        # Currently unused
        `increment_new_cards_done_today`: (Data) Whether or not to increment the SSM's `new_cards_done_today` attribute

    Possible errors:
        Manual SR Task does not exist or user is unauth: 400, Manual SR Task not found / unauthorized
    """
    try:
        manual_sr_task = ManualSRTask.objects.get(
            pk=manual_sr_id,
            user=request.user.profile,
        )
        manual_sr_task.next_review = request.data.get('next_review', manual_sr_task.next_review)
        manual_sr_task.learning_status = request.data.get('learning_status', manual_sr_task.learning_status).upper()
        manual_sr_task.interval = request.data.get('interval', manual_sr_task.interval)
        manual_sr_task.ease = request.data.get('ease', manual_sr_task.ease)
        manual_sr_task.steps_index = request.data.get('steps_index', manual_sr_task.steps_index)

        # This will eventually be re-added
        # manual_sr_task.leech_index = request.data.get('leech_index', manual_sr_task.leech_index)
        # manual_sr_task.set_is_leech(request.data.get('is_leech', manual_sr_task.is_leech), save=False)
        manual_sr_task.save()

        return Response(ManualSRTaskSerializer(manual_sr_task).data, status=200)
    except ManualSRTask.DoesNotExist:
        return Response({'message': 'Manual SR Task not found / unauthorized'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_edit_view(request, manual_sr_id, *args, **kwargs):
    """
    Edits an SR Task - POST

    Required information:
        `manual_sr_id`: (URL) Id of the Manual SR task to edit
        `new_title`: (Data) New title of the manual sr task
        `new_description`: (Data) New description of the manual sr task
    """
    try:
        task = ManualSRTask.objects.get(
            user=request.user.profile,
            pk=manual_sr_id,
        )

        task.title = request.data.get('new_title', task.title)
        task.description = request.data.get('new_description', task.description)
        task.save()

        return Response(ManualSRTaskSerializer(task).data, status=200)
    except ManualSRTask.DoesNotExist:
        return Response({'message': 'Specified Manual SR Object does not exist'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_delete_view(request, *args, **kwargs):
    """
    Deletes an SR Object - POST

    Required information:
        `manual_sr_id`: (Data) ID of the Manual SR Object to delete
    
    Possible errors:
        Object does not exist: 404, Specified Manual SR Object does not exist
    """

    try:
        ManualSRTask.objects.get(
            user=request.user.profile,
            pk=request.data.get('manual_sr_id'),
        ).delete()
        
        return Response({'message': 'Object deleted'}, status=200)
    except ManualSRTask.DoesNotExist:
        return Response({'message': 'Specified Manual SR Object does not exist'}, status=404)
