from skill_tree.serializers import MainSectionActionSerializer, SubSectionActionSerializer
from skill_tree.models import AbstractSection
from django.db.models.query_utils import Q
from decks.models import Deck, FlashCard
from decks.serializers import DeckSerializer, FlashCardSerializer, FlashcardActionSerializer
from profiles.models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.api_utils import (assert_request_data_type, get_obj_or_404,
                             get_paginated_queryset_response)

from ..models import FlashCardAction, MainSectionAction, SharedDeck, SnapShot, SubSectionAction
from ..serializers import SharedDeckSerializer, SnapShotSerializer


@api_view(['GET'])
def get_shared_deck(request, shared_deck_id, *args, **kwargs):
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'SharedDeck not found'}, status=404)

    profile_pk = getattr(getattr(request.user, 'profile', None), 'pk', None)
    if not shared_deck.has_view_access(profile_pk):
        return Response({'message': 'You are unauthorized to view this shared deck'}, status=403)

    return Response(
        SharedDeckSerializer(shared_deck, context={'request': request}).data,
        status=200,
    )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_shared_deck(request, shared_deck_id, *args, **kwargs):
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'SharedDeck not found'}, status=404)

    if not shared_deck.is_owner(request.user.profile.pk):
        return Response({'message': 'You are unauthorized to edit this shared deck'}, status=403)

    edited_values = request.data.get('edited_values')
    for attr in SharedDeck.EDITABLE_ATTRS:
        setattr(shared_deck, attr, edited_values.get(attr, getattr(shared_deck, attr)))

    owners = edited_values.get('owners')
    if (
        ', '.join([
            owner.user.username
            for owner in
            shared_deck.owners.prefetch_related('user')
        ])
        != owners
        and owners is not None
    ):
        shared_deck.owners.set(Profile.objects.filter(
            user__username__in=owners.split(', ')
        ))

    shared_deck.save()

    return Response(SharedDeckSerializer(shared_deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_create_view(request, deck_id: int, *args, **kwargs):
    """
    Creates a shared deck - POST

    Params:
        `deck_id` (URL): ID of the deck to share
        `title` (Data): Title of the new shared deck
        `description` (Data): Description of the new shared deck
        `view_access` (Data): View access of the new shared deck
        `edit_access` (Data): Edit access of the new shared deck
        `owners` (Data): Owners of the new shared deck
    """
    if resp := assert_request_data_type(request, {
        'title': str,
        'description': str,
        'view_access': str,
        'edit_access': str,
        'owners': str,
    }):
        return resp

    try:
        deck = Deck.objects.prefetch_related(
            'main_sections__sub_sections__flashcards',
            'main_sections__attached_action',
            'main_sections__sub_sections__attached_action',
            'main_sections__sub_sections__flashcards__attached_action',
        ).get(
            pk=deck_id,
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    shared_deck = SharedDeck.create(
        origin_deck=deck,
        title=request.data.get('title'),
        description=request.data.get('description'),
        view_access=request.data.get('view_access'),
        edit_access=request.data.get('edit_access'),
        owners=Profile.objects.filter(
            user__username__in=request.data.get('owners').split(', ')
        ),
    )

    return Response(SharedDeckSerializer(shared_deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copy_shared_deck_view(request, shared_deck_id, *args, **kwargs):
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_push_view(request, shared_deck_id: int, *args, **kwargs):
    """
    Pushes changes from an origin deck to a shared deck - POST

    `shared_deck_id`: ID of the shared deck
    `origin_deck_id`: ID of the origin deck
    `message`: Snapshot message
    """
    deck, resp = get_obj_or_404(Deck, request.data.get('origin_deck_id'), request.user, 'user')
    if resp:
        return resp

    shared_deck, resp = get_obj_or_404(SharedDeck, shared_deck_id, None, None)
    if resp:
        return resp

    try:
        snapshot = SharedDeck.push(
            deck=deck,
            shared_deck=shared_deck,
            author=request.user.profile,
            message=request.data.get('message', 'New snapshot'),
        )
    except ValueError:
        return Response(
            {'message': 'Deck is not up to date'},
            status=400,
            exception=True,
        )
    except PermissionError:
        return Response(
            {'message': 'You are not authorized to edit this deck'},
            status=403,
            exception=True,
        )

    return Response(SnapShotSerializer(snapshot).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pull_deck_updates(request, deck_id: int, *args, **kwargs):
    """
    Applies available updates for a deck - POST

    `deck_id`: ID of the deck to update
    """
    deck, resp = get_obj_or_404(Deck, deck_id, request.user, 'user')
    if resp:
        return resp

    deck = SharedDeck.pull(deck)

    return Response(DeckSerializer(deck).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_shared_deck_from_snapshot_id(request, snapshot_id: str, *args, **kwargs):
    """
    Gets detail about a snapshot and its shared deck from a deck's `equivalent_to_snapshot` - GET

    `snapshot_id`: ID of the snapshot to get information about
    """
    try:
        snapshot = SnapShot.objects.get(
            pk=snapshot_id,
        )
    except SnapShot.DoesNotExist:
        return Response({'message': 'SnapShot not found'}, status=404)

    if not snapshot.shared_deck.has_view_access(request.user.profile.pk):
        return Response({'message': 'You cannot view this snapshot'}, status=403)

    return Response(
        SharedDeckSerializer(snapshot.shared_deck, context={'request': request}).data,
        status=200,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deck_actions(request, deck_id: int, *args, **kwargs):
    """
    Gets the actions attached to a deck
    """
    return Response({
        'main_section_actions': MainSectionActionSerializer(
            MainSectionAction.objects.prefetch_related('main_section').filter(deck_id=deck_id),
            many=True,
        ).data,
        'sub_section_actions': SubSectionActionSerializer(
            SubSectionAction.objects.prefetch_related('sub_section').filter(deck_id=deck_id),
            many=True,
        ).data,
        'flashcard_actions': FlashcardActionSerializer(
            FlashCardAction.objects.prefetch_related('flashcard').filter(deck_id=deck_id),
            many=True,
        ).data,
    }, status=200)


@api_view(['GET'])
def snapshot_flashcards_view(request, *args, **kwargs):
    snapshot_id = request.GET.get('snapshot_id')
    if snapshot_id:
        try:
            snapshot = SnapShot.objects.get(id=snapshot_id)  # TODO: enforce view_access
        except SnapShot.DoesNotExist:
            return Response({'message': 'SnapShot not found'}, status=404)

        shared_deck = snapshot.shared_deck
    else:
        shared_deck_id = request.GET.get('shared_deck_id')
        try:
            shared_deck = SharedDeck.objects.get(id=shared_deck_id)
        except SharedDeck.DoesNotExist:
            return Response({'message': 'SharedDeck not found'}, status=404)

        snapshot = shared_deck.get_latest_snapshot()

    profile_pk = getattr(getattr(request.user, 'profile', None), 'pk', None)
    if not shared_deck.has_view_access(profile_pk):
        return Response({'message': 'You are unauthorized to view this shared deck'}, status=403)

    return get_paginated_queryset_response(
        FlashCard.objects.filter(
            Q(sub_section__main_section__snapshot_id=snapshot.pk)
            &
            AbstractSection.get_query_from_formatted_title(request.GET.get('section', ''))[0]
        ),
        request,
        FlashCardSerializer,
        page_size=min(int(request.GET.get('page_size', 250)), 250)
    )
