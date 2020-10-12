from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# from ..models import ManualSRObject
from ..serializers import ManualSRObjectSerializer
from decks.api.utils import get_paginated_queryset_response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_create_view(request, *args, **kwargs):
    ...


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manual_sr_list_view(request, *args, **kwargs):
    """
    Get's all of the current user's Manual SR Objects (Paginated)
    """
    return get_paginated_queryset_response(
        qs=request.user.profile.manual_sr_objects.all(),
        request=request,
        Serializer=ManualSRObjectSerializer,
        page_size=25,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_update_view(request, *args, **kwargs):
    ...


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_sr_delete_view(request, *args, **kwargs):
    ...
