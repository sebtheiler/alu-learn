from decks.models import Deck, FlashCard
from decks.serializers import (DeckSerializer, FlashcardActionSerializer,
                               FlashCardSerializer)
from django.db.models.query_utils import Q
from profiles.models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from skill_tree.models import AbstractSection, MainSection, SubSection
from skill_tree.serializers import (MainSectionActionSerializer,
                                    MainSectionSerializer,
                                    SubSectionActionSerializer,
                                    SubSectionSerializer)
from utils.api_utils import (assert_request_data_type, get_obj_or_404,
                             get_paginated_queryset_response)

from ..models import (FlashCardAction, MainSectionAction, SharedDeck, SnapShot,
                      SubmittedChanges, SubSectionAction)
from ..serializers import SharedDeckSerializer, SubmittedChangesSerializer


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
    shared_deck, resp = get_obj_or_404(
        SharedDeck,
        shared_deck_id,
        request.user,
        None,
    )
    if resp:
        return resp

    if not shared_deck.has_view_access(request.user.profile.pk):
        return Response({'message': 'You are not authorized to copy this shared deck'}, status=403)

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

    not_up_to_date = Response(
        {'message': 'Deck is not up to date'},
        status=400,
        exception=True,
    )

    author = request.user.profile
    message = request.data.get('message', 'New snapshot')
    if shared_deck.is_owner(author.pk):
        try:
            SharedDeck.push(
                deck=deck,
                shared_deck=shared_deck,
                author=author,
                message=message,
            )
        except ValueError:
            return not_up_to_date

        return Response(
            {'message': 'Pushed changes'},
            status=200,
        )
    elif shared_deck.has_edit_access(author.pk):
        try:
            submitted_changes = SharedDeck.submit_changes(
                deck=deck,
                shared_deck=shared_deck,
                author=author,
                message=message,
            )
        except ValueError:
            return not_up_to_date

        return Response(
            {'message': 'Submitted changes', 'submitted_changes_id': submitted_changes.pk},
            status=200,
        )
    else:
        return Response(
            {'message': 'You are not authorized to edit this deck'},
            status=403,
            exception=True,
        )


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

    deck, conflicts = SharedDeck.pull(deck)

    return Response(
        {
            'deck': DeckSerializer(deck).data,
            'conflicts': {
                'main_sections': [
                    (
                        MainSectionSerializer(ms_origin).data,
                        MainSectionSerializer(ms_destination).data
                    )
                    for (ms_origin, ms_destination) in conflicts['main_sections']
                ],
                'sub_sections': [
                    (
                        SubSectionSerializer(ss_origin).data,
                        SubSectionSerializer(ss_destination).data
                    )
                    for (ss_origin, ss_destination) in conflicts['sub_sections']
                ],
                'flashcards': [
                    (
                        FlashCardSerializer(fc_origin).data,
                        FlashCardSerializer(fc_destination).data
                    )
                    for (fc_origin, fc_destination) in conflicts['flashcards']
                ],
            },
        },
        status=200,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remix_deck(request, deck_id):
    if resp := assert_request_data_type(request, {
        'title': str,
        'description': str,
        'view_access': str,
        'edit_access': str,
    }):
        return resp

    try:
        origin_deck = Deck.objects.get(
            pk=deck_id,
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    shared_deck = SharedDeck.remix(
        origin_deck=origin_deck,
        title=request.data.get('title'),
        description=request.data.get('description'),
        view_access=request.data.get('view_access'),
        edit_access=request.data.get('edit_access'),
    )

    return Response(SharedDeckSerializer(shared_deck).data, status=201)


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
            snapshot = SnapShot.objects.get(id=snapshot_id)
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


@api_view(['POST'])
def resolve_conflict(request, *args, **kwargs):
    # Get origin and destination data
    model_type = request.data.get('model_type')
    if model_type == 'MAIN_SECTION':
        try:
            origin = MainSection.objects.get(
                pk=request.data.get('main_section_origin_id'),
            )
            destination = MainSection.objects.get(
                pk=request.data.get('main_section_destination_id'),
            )
        except MainSection.DoesNotExist:
            return Response({'message': 'Main section not found'}, status=404)
    elif model_type == 'SUB_SECTION':
        try:
            origin = SubSection.objects.get(
                pk=request.data.get('sub_section_origin_id'),
            )
            destination = SubSection.objects.get(
                pk=request.data.get('sub_section_destination_id'),
            )
        except SubSection.DoesNotExist:
            return Response({'message': 'Sub section not found'}, status=404)
    elif model_type == 'FLASHCARD':
        try:
            origin = FlashCard.objects.get(
                pk=request.data.get('flashcard_origin_id'),
            )
            destination = FlashCard.objects.get(
                pk=request.data.get('flashcard_destination_id'),
            )
        except FlashCard.DoesNotExist:
            return Response({'message': 'Flashcard not found'}, status=404)
    else:
        return Response({'message': 'Unrecognized model type'}, status=400)

    # Check that the current user has access to both
    if not origin.data.has_view_access(request.user.profile.pk):
        return Response({'message': 'Unauthorized to view origin data'}, status=403)

    if not destination.data.has_edit_access(request.user.profile.pk):
        return Response({'message': 'Unauthorized to edit destination data'}, status=403)

    # Update destination data with origin data
    destination.data.pull(origin.data, save=True)

    # Delete the action attached to the destination
    destination.attached_action.delete()

    return Response({'message': 'Resolved conflict'}, status=200)


@api_view(['GET'])
def list_submitted_changes(request, shared_deck_id: int, *args, **kwargs):
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    if not shared_deck.has_view_access(request.user.profile.pk):
        return Response({'message': 'You are not authorized to view this shared deck'}, status=403)

    return Response(
        SubmittedChangesSerializer(
            shared_deck.submitted_changes.all(),
            many=True,
        ).data,
        status=200,
    )


@api_view(['GET'])
def get_submitted_changes(request, submitted_changes_id, *args, **kwargs):
    try:
        submitted_changes = SubmittedChanges.objects\
            .select_related('shared_deck')\
            .get(pk=submitted_changes_id)
    except SubmittedChanges.DoesNotExist:
        return Response({'message': 'Submitted changes not found'}, status=404)

    shared_deck = submitted_changes.shared_deck
    profile_pk = request.user.profile.pk if request.user.is_authenticated else None
    if not shared_deck.has_view_access(profile_pk):
        return Response({'message': 'You are not authorized to view this shared deck'}, status=403)

    return Response(
        {
            'changes': SubmittedChangesSerializer(
                submitted_changes,
                context={'full_detail': True},
            ).data,
            'is_owner': shared_deck.is_owner(profile_pk)
        },
        status=200,
    )


@api_view(['POST'])
def decide_submitted_changes(request, submitted_changes_id, *args, **kwargs):
    try:
        submitted_changes = SubmittedChanges.objects\
            .select_related('shared_deck')\
            .get(pk=submitted_changes_id)
    except SubmittedChanges.DoesNotExist:
        return Response({'message': 'Submitted changes not found'}, status=404)

    shared_deck = submitted_changes.shared_deck
    author = request.user.profile if request.user.is_authenticated else None
    if author is None or not shared_deck.is_owner(author.pk):
        return Response({'message': 'You are not an owner of this shared deck'}, status=403)

    decision = request.data.get('decision')
    if decision == 'ACCEPT':
        submitted_changes.accept()
        return Response({'message': 'Accepted changes'}, status=200)
    elif decision == 'DENY':
        submitted_changes.deny()
        return Response({'message': 'Denied changes'}, status=200)
    else:
        return Response({'message': 'Unrecognized `decision`'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_remixed_from(request, shared_deck_id):
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    if not shared_deck.has_view_access(request.user.profile.pk):
        return Response({'message': 'You are not authorized to view this shared deck'}, status=403)

    remixed_from = set()

    # TODO: prefetch recursively
    snapshot = shared_deck.get_latest_snapshot(prefetch=False)
    while snapshot is not None:
        remixed_from.add(snapshot.shared_deck_id)
        snapshot = snapshot.parent

    remixed_from.remove(shared_deck_id)

    remixed_from = SharedDeck.objects.filter(pk__in=remixed_from)

    return Response(SharedDeckSerializer(remixed_from, many=True).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merge_shared_decks(request, shared_deck_id):
    try:
        shared_deck_to_update = SharedDeck.objects.get(pk=shared_deck_id)
        shared_deck_to_merge = SharedDeck.objects.get(
            pk=request.data.get('shared_deck_to_merge_id'),
        )
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    if not shared_deck_to_update.is_owner(request.user.profile.pk):
        return Response({'message': 'You do not have permission to merge'}, satus=403)

    if not shared_deck_to_merge.has_view_access(request.user.profile.pk):
        return Response({'message': 'You do not have permission view this deck'}, satus=403)

    snapshot = SharedDeck.merge(shared_deck_to_update, shared_deck_to_merge)
    if snapshot is None:
        return Response({'message': 'Nothing to merge'}, status=200)

    return Response({'message': 'Merged'}, status=200)
