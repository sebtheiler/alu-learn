from decks.models import Deck
from decks.serializers import DeckSerializer, FlashCardSerializer
from profiles.models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.api_utils import (assert_request_data_type, get_obj_or_404,
                             get_paginated_queryset_response)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_clone_view(request, shared_deck_id, *args, **kwargs):
    """
    Copies a shared deck - POST

    `title` (Data): Title of the destination deck
    """
    # TODO: Enforce view_access
    shared_deck, resp = get_obj_or_404(
        SharedDeck,
        shared_deck_id,
        request.user,
        None,
    )
    if resp:
        return resp

    deck = shared_deck.copy(
        request.user,
        request.data.get('title', shared_deck.title),
    )

    return Response(DeckSerializer(deck).data, status=200)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def shared_deck_push


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def snapshot_flashcards_view(request, *args, **kwargs):
    snapshot_id = request.GET.get('snapshot_id')
    if snapshot_id:
        try:
            snapshot = SnapShot.objects.get(id=snapshot_id)  # TODO: enforce view_access
        except SnapShot.DoesNotExist:
            return Response({'message': 'SnapShot not found'}, status=404)
    else:
        shared_deck_id = request.GET.get('shared_deck_id')
        try:
            shared_deck = SharedDeck.objects.get(id=shared_deck_id)
        except SharedDeck.DoesNotExist:
            return Response({'message': 'SharedDeck not found'}, status=404)

        snapshot = shared_deck.get_latest_snapshot()

    return get_paginated_queryset_response(
        snapshot.flashcards.all(),
        request,
        FlashCardSerializer,
        page_size=min(int(request.GET.get('page_size', 250)), 250)
    )
