from decks.api.utils import get_paginated_queryset_response
from django.utils import timezone
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
    
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

    created_obj = ManualSRTask.objects.create(
        user=request.user.profile,
        next_review=this_morning,
        title=title,
        description=desc if desc else [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      },
    ],
  },
],
    )

    return Response(ManualSRTaskSerializer(created_obj).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manual_sr_list_view(request, *args, **kwargs):
    """
    Get's all of the current user's Manual SR Objects (Paginated) - GET
    """
    return get_paginated_queryset_response(
        qs=request.user.profile.manual_sr_objects.all().order_by('-next_review'),
        request=request,
        Serializer=ManualSRTaskSerializer,
        page_size=25,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_update_view(request, *args, **kwargs):
    ...


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
