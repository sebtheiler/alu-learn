from decks.models import Deck
from decks.serializers import FlashCardSerializer
from profiles.models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.api_utils import assert_request_data_type, get_paginated_queryset_response

from ..models import SharedDeck, SnapShot
from ..serializers import SharedDeckSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_create_view(request, *args, **kwargs):
    """
    Creates a shared deck - POST

    Params:
        `origin_deck_id` (Data): ID of the deck to share
        `title` (Data): Title of the new shared deck
        `description` (Data): Description of the new shared deck
        `view_access` (Data): View access of the new shared deck
        `edit_access` (Data): Edit access of the new shared deck
        `owners` (Data): Owners of the new shared deck
    """
    if resp := assert_request_data_type(request, {
        'origin_deck_id': int,
        'title': str,
        'description': str,
        'view_access': str,
        'edit_access': str,
        'owners': str,
    }):
        return resp

    try:
        deck = Deck.objects.get(
            pk=request.data.get('origin_deck_id'),
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    try:
        owners = [
            Profile.objects.get(user__username=username)
            for username in
            request.data.get('owners').split(', ')
        ]
    except Profile.DoesNotExist:
        return Response({'message': 'Profile not found for owners'}, status=404)

    shared_deck = SharedDeck.create(
        origin_deck=deck,
        title=request.data.get('title'),
        description=request.data.get('description'),
        view_access=request.data.get('view_access'),
        edit_access=request.data.get('edit_access'),
        owners=owners,
    )

    return Response(SharedDeckSerializer(shared_deck).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def snapshot_flashcards_view(request, *args, **kwargs):
    try:
        snapshot = SnapShot.objects.get(id=request.GET.get('snapshot_id'))  # TODO: enforce view_access
    except SnapShot.DoesNotExist:
        return Response({'message': 'SnapShot not found'}, status=404)

    return get_paginated_queryset_response(
        snapshot.flashcards.all(),
        request,
        FlashCardSerializer,
        page_size=min(int(request.GET.get('page_size', 250)), 250)
    )
