import json
import random
import re
from typing import List
from utils.utils import assert_dict_data_type

from django.core.cache import cache
from django.db.models import Q
from django.views.decorators.cache import cache_control
from django.views.decorators.vary import vary_on_cookie
# For calculating advanced string similarities (used in searching)
# pip install fuzzywuzzy
# pip install fuzzywuzzy[speedup]
from fuzzywuzzy import fuzz
from profiles.models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils import (create_slate_element, get_morning,
                   get_paginated_queryset_response, weighted_sample)

from ..models import (CustomStudySessionManager, Deck, DeckStudySessionManager,
                      FlashCard, ReviewInstance, SharedDeck,
                      SharedDeckRelation)
from ..serializers import (DeckSerializer, FlashCardSerializer,
                           ReviewInstanceSerializer, SharedDeckSerializer)


# ====== Decks ======
# ===== Deck Lists =====
@api_view(['GET'])
@vary_on_cookie
@cache_control(private=True)
def deck_shared_list(request, username: str, *args, **kwargs) -> List[SharedDeck]:
    """
    Gets decks from a user that are either shared with the requester or public - GET

    Required information:
        `username`: (URL) Username of the user to get decks from
    """
    # Get user
    try:
        profile = Profile.objects.get(user__username=username)
    except Profile.DoesNotExist:
        return Response({'message': f'Invalid username "{username}"'}, status=404)

    # Get user's decks that are either public or shared
    is_friend = request.user in profile.friends.all()
    if is_friend or profile.user.id == request.user.id:
        decks_qs = SharedDeck.objects.filter(
            Q(user__username=username) &
            (Q(sharing_setting='PUBLIC') | Q(sharing_setting='FRIENDS'))
        )
    else:
        decks_qs = SharedDeck.objects.filter(
            user__username=username,
            sharing_setting='PUBLIC',
        )

    return Response(SharedDeckSerializer(decks_qs, many=True).data, status=200)


# TODO: Rename and revamp
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_quick_list_view(request, *args, **kwargs):
    """
    Gets a minified list of decks and their progress for use on the main homepage - GET

    Parameters:
        calc_percent_complete=False: (GET) Calc the percent complete for each deck
        include_has_shared_deck=False: (GET) Include decks that have been shared
    """
    decks_query = Q(
        user=request.user,
        deck_type='standard',
        student_attached_to=None,
    )
    if not request.GET.get('include_has_shared_deck', False):
        decks_query &= Q(shared_deck=None)

    decks = Deck.objects.filter(
        decks_query
    ).order_by('title')  # type: List[Deck]

    flashcards = ReviewInstance.objects.filter(
        flashcard__deck__in=decks,
    )

    calc = request.GET.get('calc_percent_complete', False)
    data = [
        {
            'title': deck.title,
            'id': deck.pk,
            'percent_complete': deck.calc_percent_complete(flashcards) if calc else None,
        }
        for deck in decks
    ]

    return Response(data, status=200)


@api_view(['GET'])
def deck_flashcards_view(request, deck_id, *args, **kwargs):
    """
    Gets flashcards from a deck - GET

    Required information:
        `deck_id`: (URL) The ID of the deck
        `limit`: (GET) Number of results to return (optional)
            if True, instead of directly returning flashcards it will return:
                'results': Regular list of flashcards
                'count': Total number of flashcards
        `reverse`: (GET) Reverse the results (ignored if `limit` is specified)

    Returns:
        Author of the deck (PublicProfileSerializer): 'author'
        Title of the deck: 'title'
        ID of the deck: 'id'

    Possible errors:
        Invalid deck: 404, Deck not found
        Deck is not shared with user: 403, You are unauthorized to view this deck
    """
    # Get deck
    try:
        deck = SharedDeck.objects.get(pk=deck_id)
    except SharedDeck.DoesNotExist:
        try:
            deck = Deck.objects.get(pk=deck_id)
        except Deck.DoesNotExist:
            return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not deck.user_has_access(request.user):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    limit = request.GET.get('limit')
    if limit:
        # Return set number of flashcards (not paginated)
        serializer = FlashCardSerializer(
            deck.flashcards.all()[:int(limit)],
            context={'request': request},
            many=True,
        )

        return Response({
            'results': serializer.data,
            'count': deck.flashcards.count(),
        })
    else:
        # Return paginated list of all flashcards
        reverse = request.GET.get('reverse')
        return get_paginated_queryset_response(
            deck.flashcards.order_by('flashcard_num' if not reverse else '-flashcard_num'),
            request,
            FlashCardSerializer,
            page_size=250
        )


# ===== Shared Decks =====
# TODO: delete and use `custom_..._func`
@api_view(['GET'])
def shared_deck_detail_view(request, shared_deck_id, *args, **kwargs):
    """
    Get specific information about a deck - GET

    Required information:
        `deck_id`: (URL) The ID of the deck

    Returns:
        Author of the deck (PublicProfileSerializer): 'author'
        Title of the deck: 'title'
        ID of the deck: 'id'

    Possible errors:
        Invalid deck: 404, Deck not found
        Deck is not shared with user: 403, You are unauthorized to view this deck
    """
    # Get deck
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not shared_deck.user_has_access(request.user):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    return Response(
        SharedDeckSerializer(
            shared_deck,
            context={'request': request}
        ).data,
        status=200,
    )


# TODO: Rewrite view, along with other function-views, to be simpler
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_create_view(request, *args, **kwargs):
    """
    Creates a shared deck - POST

    Required information:
        `origin_deck_id`: (Data) Id of the deck that will be made shared
        `title`: (Data) Title of the public deck to create
        `description`: (Data) Description of the public deck to create
        `sharing_setting`: (Data) 'FRIENDS' or 'PUBLIC'
    """
    # Get deck to originate from
    try:
        origin_deck = Deck.objects.get(
            pk=request.data.get('origin_deck_id'),
            user=request.user,
        )  # type: Deck
    except Deck.DoesNotExist:
        return Response({'message': 'This deck does not exist / you are unauthorized'}, status=400)

    # Create shared deck object
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'Title must not be None'}, status=400)

    shared_deck = origin_deck.create_shared_deck(
        title,
        request.data.get('description', ''),
        request.data.get('sharing_setting', 'PUBLIC'),
    )

    return Response(SharedDeckSerializer(shared_deck).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_clone_view(request, shared_deck_id, *args, **kwargs):
    """
    Clones a shared deck for a user that is not the author to use it - POST

    Required information:
        `shared_deck_id`: (URL) Id of the shared deck
        `destination_deck_title`: (Data) Title of the deck to clone into
    """
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
        if not shared_deck.user_has_access(request.user):
            return Response({'message': 'You are unauthorized to clone this deck'}, status=403)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    # Check if the user has already cloned this deck
    if SharedDeckRelation.objects.filter(
        deck__user=request.user,
        shared_deck=shared_deck,
    ).exists():
        return Response({'message': 'You have already cloned this deck'}, status=400)

    deck = shared_deck.clone(
        request.user,
        request.data.get('destination_deck_title'),
        request.data,
    )

    return Response(DeckSerializer(deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_push_updates_view(request, shared_deck_id, *args, **kwargs):
    """
    Allows the author of a shared deck to push flashcard changes - POST

    Required information:
        `shared_deck_id`: (Data) Id of the shared deck
        `origin_deck_id`: (Data) Id of the deck to get new changes from
        `check_diff_only`: (Data) If True, this will get the difference between the
            shared deck and the origin deck, and not actually enact the changes
    """
    check_diff_only = request.data.get('check_diff_only', False)

    # Get shared deck
    try:
        shared_deck = SharedDeck.objects.get(
            pk=shared_deck_id,
            user=request.user,
        )
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Could not find the specified shared deck'}, status=404)

    # Get origin deck
    try:
        origin_deck = Deck.objects.get(
            pk=request.data.get('origin_deck_id'),
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'This deck does not exist / you are unauthorized'}, status=400)

    data = shared_deck.push_updates(origin_deck, check_diff_only)
    if isinstance(data, SharedDeck):
        data = SharedDeckSerializer(data).data

    return Response(data, status=200)


# TODO: Combine with `deck_pull_updates_view`
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_get_updates_view(request, deck_id, *args, **kwargs):
    """
    Gets the updates for a deck - GET

    Required information:
        `deck_id`: (URL) Id of the deck to get updates for
    """
    # Get deck
    try:
        deck = Deck.objects.get(
            pk=deck_id,
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck does not exist / you are unauthorized'}, status=400)

    # Find decks that need updating
    needs_updating = deck.list_available_updates()

    return Response({'needs_updating': needs_updating}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_pull_updates_view(request, deck_id, *args, **kwargs):
    """
    Gets the updates for a deck - POST

    Required information:
        `deck_id`: (URL) Id of the deck to updates
        `to_pull_from`: (Data) Id of the shared deck to pull changes from
    """
    # Get deck
    try:
        deck = Deck.objects.get(
            pk=deck_id,
            user=request.user,
        )  # type: Deck
    except Deck.DoesNotExist:
        return Response({'message': 'Deck does not exist'}, status=400)

    # Get shared deck
    to_pull_from = request.data.get('to_pull_from')
    try:
        shared_deck = SharedDeck.objects.get(pk=to_pull_from)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck does not exist'}, status=400)

    deck = deck.pull_updates(shared_deck)

    return Response(DeckSerializer(deck).data, status=200)


# ===== Deck Import/Export =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_json_export_view(request, deck_id, *args, **kwargs):
    """
    Exports a deck to its serialized JSON form - GET

    Params:
        `export_review_instances=True` (GET)?: If false this will not export review instances
    """
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    export_review_instances = request.GET.get('export_review_instances', True)
    if isinstance(export_review_instances, str):
        export_review_instances = export_review_instances.lower() == 'true'

    json_deck = {
        'title': deck.title,
        'flashcards': [
            {
                'fields': flashcard.fields,
                'tags': flashcard.tags,
                'flashcard_type': flashcard.flashcard_type,
                'flashcard_num': flashcard.flashcard_num,
                'review_instances': [
                    {
                        'content_indicies': review_instance.content_indicies,
                        'name': review_instance.name,
                        'learning_status': review_instance.learning_status,
                        'steps_index': review_instance.steps_index,
                        'ease': review_instance.ease,
                        'next_review': review_instance.next_review,
                        'last_review': review_instance.last_review,
                        'is_suspended': review_instance.is_suspended,
                        'leech_index': review_instance.leech_index,
                    }
                    for review_instance in flashcard.review_instances.all()
                ] if export_review_instances else None,
            }
            for flashcard in deck.flashcards.order_by('flashcard_num').all()
        ],
    }

    return Response(json_deck, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_json_import_view(request, *args, **kwargs):
    """
    Imports a deck based on a JSON file exported from Alu - POST

    Params:
        The entire request object must be in the format of a json_deck
    """
    json_deck = request.data
    title = json_deck.get('title')
    json_flashcards = json_deck.get('flashcards')
    if title is None or json_flashcards is None:
        return Response(
            {'message': '`json_deck` must have `title` and `flashcards` attributes'},
            status=400,
        )

    # Create deck
    deck = Deck.objects.create(
        user=request.user,
        title=title,
    )

    # Create flashcards
    flashcards_to_create = []
    review_instances_to_create = []
    for i, json_flashcard in enumerate(json_flashcards):
        flashcard = FlashCard(
            deck=deck,
            flashcard_type=json_flashcard.get('flashcard_type', 'basic'),
            flashcard_num=json_flashcard.get('flashcard_num', i),
            # Tags
            fields=json_flashcard.get('fields', []),
            tags=json_flashcard.get('tags', ''),
        )
        flashcards_to_create.append(flashcard)

        if json_flashcard.get('review_instances') is None:
            review_instances_to_create += ReviewInstance.create_review_instance(
                json_flashcard.get('flashcard_type', 'basic'),
                flashcard,
            )

            continue

        review_instances_to_create += [
            ReviewInstance(
                flashcard=flashcard,
                content_indicies=json_review_instance.get('content_indicies', []),
                name=json_review_instance.get('name', ''),
                learning_status=json_review_instance.get('learning_status', 'UNSEEN'),
                steps_index=json_review_instance.get('steps_index', 0),
                ease=json_review_instance.get('ease', 250),
                next_review=json_review_instance.get('next_review', get_morning()),
                last_review=json_review_instance.get('last_review', get_morning()),
                is_suspended=json_review_instance.get('is_suspended', False),
                leech_index=json_review_instance.get('leech_index', 0),
            )
            for json_review_instance in json_flashcard.get('review_instances')
        ]

    FlashCard.objects.bulk_create(flashcards_to_create)
    ReviewInstance.objects.bulk_create(review_instances_to_create)

    return Response(DeckSerializer(deck).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_txt_import_view(request, *args, **kwargs):
    """
    Import a deck from a .txt file - POST

    Required information:
        deck_title: Title of the deck to create
        uploaded_file: Contents of the uploaded file
    """
    # Get information
    deck_title = request.data.get('deck_title')
    uploaded_file = request.data.get('uploaded_file')

    # Parse text document
    split_lines = uploaded_file.split('\n')
    front_and_back = [line.split('\t') for line in split_lines if line]

    # Get/create deck with given title
    deck, created = Deck.objects.get_or_create(user=request.user, title=deck_title)

    # Create flashcards
    max_flashcard_num = FlashCard.get_max_flashcard_num(deck)
    flashcards = FlashCard.objects.bulk_create([
        FlashCard(
            deck=deck,
            flashcard_type='basic',
            flashcard_num=max_flashcard_num + i + 1,
            fields=[
                create_slate_element(front_and_back[i][0]),
                create_slate_element(front_and_back[i][1]),
            ],
        )
        for i in range(len(front_and_back))
    ])

    this_morning = get_morning()
    ReviewInstance.objects.bulk_create([
        ReviewInstance(
            flashcard=flashcard,
            next_review=this_morning,
            content_indicies=[0, 1],
        )
        for flashcard in flashcards
    ])

    return Response(DeckSerializer(deck).data, status=201)


# ===== Other deck functions =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_generate_skill_tree_view(request, deck_id, *args, **kwargs):
    """
    Generates and saves a skill tree for a deck - POST

    Params:
        `deck_id` (URL, int): Id of the deck to generate the skill tree for
        `sort` (data, bool): Whether or not to alphabetically sort the skill tree
        `remove_essential` (data, bool): If True, ignore the "essential" tag
    """
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    sort = request.data.get('sort')
    remove_essential = request.data.get('remove_essential')
    deck.skill_tree = deck.generate_skill_tree(
        sort=sort,
        remove_essential=remove_essential,
    )
    deck.save()

    return Response(deck.skill_tree, status=200)


# TODO: do something to make functions easily accessable
# and combine with skill_tree gen et al
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_statistics_view(request, deck_id, *args, **kwargs):
    """
    Gets statistics information about a deck to display on the deck's statistics page - GET

    Parameters:
        `deck_id`: (Url) Id of the deck to get statistics about
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    return Response(deck.get_statistics(), status=200)


# TODO: Rewrite function
@api_view(['GET'])
def deck_search_view(request, *args, **kwargs):
    """
    Searches for decks based on a query - GET

    Required information:
        `q`: (GET) Query for searching

    Possible errors:
        No query: 400, Please specify a query

    Returns:
        A list of decks (DeckSerializer)
    """
    query = request.GET.get('q')
    if query is None:
        return Response({'message': 'Please specify a query'}, status=400)

    # Attempt to read cached value for query
    # (spaces will break it, so we need to replace them)
    CACHE_KEY = f'deck-search-q="{query.replace(" ", "<<SPACE_CHAR>>")}"'
    sorted_qs = cache.get(CACHE_KEY)

    if sorted_qs is None:
        # Get all public decks
        deck_qs = SharedDeck.objects.filter(sharing_setting='PUBLIC')

        # Function for calculating how "relevant" each search result is
        THRESHOLD = 120

        def sorting_function(deck):
            return -(
                + fuzz.token_set_ratio(query, deck.description) * 1.0
                + fuzz.token_set_ratio(query, deck.title) * 2.0
                + fuzz.token_set_ratio(query, deck.user.username) * 0.8
            )

        # Sort based on function
        sorted_qs = sorted(
            [deck for deck in deck_qs if sorting_function(deck) < -THRESHOLD],
            key=sorting_function,
        )

        # Cache result for 6 hours
        cache.set(CACHE_KEY, sorted_qs, 60*60*6)

    return get_paginated_queryset_response(sorted_qs, request, SharedDeckSerializer, 5)


# ====== Flashcards ======
# ===== Flashcard Operations =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_create_view(request, deck_id, *args, **kwargs):
    """
    Create a flashcard to a deck - GET/POST

    Required information:
        `deck_id`: (URL) ID of the deck to create a flashcard in
        `fields`: (Data) List of the fields and their data for the flashcard
        `tags`: (Data) Raw string of tags, separated by commas
        `flashcard_type`: (Data) Type of flashcard
    """
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response(
            {'message': 'Deck not found / unauthorized'},
            status=400,
        )

    fields = request.data.get('fields')
    flashcard_type = request.data.get('flashcard_type', 'basic')
    tags = request.data.get('tags', '')
    if fields is None:
        return Response({'message': '`fields` must not be None'}, status=400)

    flashcards = FlashCard.create_flashcard(
        deck,
        tags,
        flashcard_type,
        fields,
    )

    return Response(
        ReviewInstanceSerializer(instance=flashcards, many=True).data,
        201,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_edit_view(request, flashcard_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Params:
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `fields`: (Data) List of the fields for the flashcard
        `tags`: (Data) Raw string of tags, separated by commas
    """
    # Get the flashcard
    try:
        flashcard = FlashCard.objects.get(
            pk=flashcard_id,
            deck__user=request.user,
        )
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    flashcard.tags = request.data.get('tags', flashcard.tags)

    new_fields = request.data.get('fields')
    if new_fields is not None:
        flashcard.fields = new_fields

        if flashcard.flashcard_type == 'cloze':
            # Create or delete new flashcards depending on how the cloze has changed
            review_instances = flashcard.review_instances.all()
            flashcards_to_create = []
            created_flashcard_cloze_nums = []
            flashcards_to_delete = [ri.id for ri in review_instances]

            # Go through all segments identified as a cloze
            this_morning = get_morning()
            cloze_regex = r"{{c\d*::.*?}}"
            for match in re.finditer(cloze_regex, json.dumps(new_fields[0]), re.MULTILINE):
                cloze_num = int(match.group().split("::")[0][3:])
                try:
                    # If the flashcard already exists, mark it as not needing deletion
                    ri = review_instances.get(name=f'cloze-{cloze_num}')
                    try:
                        # The flashcard is still used, so we shouldn't delete it
                        flashcards_to_delete.remove(ri.id)
                    except ValueError:
                        pass
                except ReviewInstance.DoesNotExist:
                    # If the flashcard does not exist, create it
                    if cloze_num not in created_flashcard_cloze_nums:
                        created_flashcard_cloze_nums.append(cloze_num)
                        flashcards_to_create.append(
                            ReviewInstance(
                                flashcard=flashcard,
                                next_review=this_morning,
                                content_indicies=[0],
                                name=f'cloze-{cloze_num}'
                            )
                        )

            # Apply delete and create operations
            ReviewInstance.objects.bulk_create(flashcards_to_create)
            review_instances.filter(id__in=flashcards_to_delete).delete()

    flashcard.save()
    return Response(FlashCardSerializer(instance=flashcard).data, 200)


# TODO: make function on `api_gen`
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_rearrange_view(request, deck_id, flashcard_num, *args, **kwargs):
    """
    Rearranges flashcards - POST

    Required information:
        `flashcard_id`: Id of the FlashCard to rearrange
        `rearrange_type`: Way to rearrange the flashcard
            'UP': Decrease the flashcard's number
            'DOWN': Increase the flashcard's number
    """
    try:
        flashcard = FlashCard.objects.get(
            flashcard_num=flashcard_num,
            deck__pk=deck_id,
            deck__user=request.user,
        )
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found'}, status=404)

    rearrange_type = request.data.get('rearrange_type')
    msg = flashcard.rearrange(rearrange_type)
    if msg is not None:
        return Response({'message': msg}, status=400)

    return Response(FlashCardSerializer(flashcard).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcard_search_view(request, *args, **kwargs):
    """
    Searches for flashcards based on some parameters - GET

    Required information:
        `deckIds`: (GET) IDs (plural) of decks to search in
        `tags`: (GET) Tags of flashcards to get
        `contains`: (GET) Front/back of card contains these words
        `suspended`: (GET) Whether or not the card is suspended
        `leech`: (GET) Whether or not the card is a leech
        `learningStatus`: (GET) Learning status of the card
        `minEase`: (GET) Minimum ease factor of the card
        `maxEase`: (GET) Maximum ease factor of the card

    Returns:
        A list of flashcards (FlashcardSerializer)
    """
    flashcard_qs = ReviewInstance.search_flashcards(
        request.user,
        request.GET.get('deckIds'),
        request.GET.get('tags'),
        request.GET.get('contains'),
        request.GET.get('suspended'),
        request.GET.get('leech'),
        request.GET.get('learningStatus'),
        request.GET.get('minEase'),
        request.GET.get('maxEase'),
    )

    return Response(ReviewInstanceSerializer(flashcard_qs, many=True).data, status=200)


# ==== Flashcard Bulk Update ====
# TODO: Combine with function views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_edit_tags_bulk_view(request, *args, **kwargs):
    """
    Edits multiple flashcard's tags at once - POST

    Required information:
        `flashcard_ids`: Ids for all the flashcards to edit
        `action`: ADD/REMOVE/RENAME
        `tag`: Tag to add/remove
    """
    flashcard_ids = request.data.get('flashcard_ids', [])
    action = request.data.get('action')
    tag = request.data.get('tag')
    if len(flashcard_ids) == 0:
        return Response({'message': 'Must specify at least one flashcard Id'}, status=400)
    elif action not in ('ADD', 'REMOVE', 'RENAME'):
        return Response({'message': 'Invalid action'}, status=400)
    elif not isinstance(tag, str):
        return Response({'message': 'You must specify a tag to add/remove'}, status=400)

    flashcards = FlashCard.objects.filter(
        deck__user=request.user,
        pk__in=flashcard_ids,
    )
    if flashcards.count() != len(flashcard_ids):
        return Response({'message': 'Could not find all flashcards specified'}, status=400)

    if action == 'ADD':
        for flashcard in flashcards:
            flashcard.add_tag(tag, False)
    elif action == 'REMOVE':
        for flashcard in flashcards:
            flashcard.remove_tag(tag, False)
    elif action == 'RENAME':
        rename_to = request.data.get('rename_to')
        if rename_to is None:
            return Response({'message': 'If renaming, you must specify `rename_to`'}, status=400)
        for flashcard in flashcards:
            flashcard.rename_tag(tag, rename_to, False)

    FlashCard.objects.bulk_update(flashcards, ['tags'])
    return Response({'message': 'Updated tags'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_review_instance_bulk_update_view(request, *args, **kwargs):
    """
    Bulk updated flashcards - POST

    Required information:
        `flashcard_ids`: Ids of the flashcard review instances to update
        `action`: Action to take on the flashcards SUSPEND/UNSUSPEND/DELETE
    """
    flashcard_ids = request.data.get('flashcard_ids', [])
    action = request.data.get('action')
    if len(flashcard_ids) == 0:
        return Response({'message': 'Must specify at least one flashcard Id'}, status=400)

    flashcards = ReviewInstance.objects.filter(
        flashcard__deck__user=request.user,
        pk__in=flashcard_ids,
    )
    if flashcards.count() != len(flashcard_ids):
        return Response({'message': 'Could not find all flashcards specified'}, status=400)

    if action == 'SUSPEND':
        flashcards.update(is_suspended=True)
    elif action == 'UNSUSPEND':
        flashcards.update(is_suspended=False)
    elif action == 'DELETE':
        flashcards = FlashCard.objects.filter(review_instances__in=flashcards)
        flashcards.delete()
    else:
        return Response({'message': 'Invalid action'}, status=400)

    return Response({'message': 'Edited flashcard review instances'}, status=200)


# ===== Flashcard Study =====
# TODO: Rewrite function
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ssm_flashcards_view(request, ssm_id, *args, **kwargs):
    """
    Gets the due flashcards from a SSM - GET

    Required information:
        `ssm_id`: (URL) ID of the study session manager
        `from_overflow_bucket`=false: (GET) If True, load reviews from
            the overflow bucket rather than from the reviews for this single day

    Possible errors:
        SSM does not exist: 404, SSM does not exist
    """
    try:
        ssm = DeckStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
    except DeckStudySessionManager.DoesNotExist:
        try:
            ssm = CustomStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
        except CustomStudySessionManager.DoesNotExist:
            return Response({'message': 'SSM does not exist'}, status=404)

    seen_flashcards, unseen_flashcards = ssm.get_flashcards()
    reviews = ssm.get_reviews(
        seen_flashcards,
        unseen_flashcards,
        request.GET.get('from_overflow_bucket') == 'true',
    )

    return Response({
        'flashcards': ReviewInstanceSerializer(reviews['flashcards'], many=True).data,
        'num_overflow': reviews['num_overflow'],
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def game_flashcards_view(request, *args, **kwargs):
    """
    Gets the flashcards for a game, based on some parameters - POST

    Required information:
        `deck_id`: (Data) Id of the deck to pull flashcards from
        `type`: (Data) Method used to get flashcards ("SEEN", "UNSEEN", "TAG")
        `amount`: (Data) Number of flashcards to return
    """
    method_type = request.data.get('type')
    deck_id = request.data.get('deck_id')
    amount = request.data.get('amount')
    if None in (method_type, deck_id, amount):
        return Response({'message': 'You must specify type, deck_id, and amount'}, status=400)

    query = Q(flashcard__deck__user=request.user)
    if not request.data.get('options').get('include_cloze'):
        query &= ~Q(flashcard__flashcard_type='cloze')

    # See if the "deck" is actually a CSSM
    try:
        cssm = CustomStudySessionManager.objects.get(pk=deck_id, user=request.user.profile)
    except CustomStudySessionManager.DoesNotExist:
        cssm = None

    if cssm:
        query &= cssm.generate_query()
    else:
        query &= Q(flashcard__deck__id=deck_id)

    # Get the list of all possible flashcards, based on the method type
    if method_type == 'SEEN' or method_type == 'PERSONAL':
        query &= ~Q(learning_status='UNSEEN')
    elif method_type == 'UNSEEN':
        query &= Q(learning_status='UNSEEN')
    elif method_type == 'TAG':
        query &= ReviewInstance.search_tags(
            request.data.get('options').get('tag'),
        )
    elif method_type == 'ALL':
        pass
    else:
        return Response({'message': 'Unrecognized method for getting flashcards'}, status=400)

    flashcards = ReviewInstance.objects.filter(query)

    # Get `amount` random flashcards from the list
    if method_type == 'PERSONAL':
        # 350 = max ease
        flashcard_weights = [(350 - flashcard.ease)**2 for flashcard in flashcards]
        flashcards = weighted_sample(list(flashcards), flashcard_weights, amount)
    elif request.data.get('random_order'):
        flashcard_ids = flashcards.values_list('id', flat=True)
        random_flashcard_ids = random.sample(list(flashcard_ids), min(flashcards.count(), amount))
        flashcards = ReviewInstance.objects.filter(pk__in=random_flashcard_ids)
    else:
        flashcards = flashcards[:amount]

    return Response(ReviewInstanceSerializer(flashcards, many=True).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_instance_study_view(request, *args, **kwargs) -> List[ReviewInstance]:
    """
    Get review instances to study - POST

    `deck_id` (Data)?: Id of the deck to get flashcards from
    `tag_query` (Data)?: Tag query to search flashcards
    """
    # Build base query
    # TODO: re-add cloze flashcards
    review_instance_query = ~Q(flashcard__flashcard_type='cloze')

    if (deck_id := request.data.get('deck_id')) and isinstance(deck_id, int):
        review_instance_query &= Q(
            flashcard__deck__pk=deck_id,
            flashcard__deck__user=request.user,
        )

    if (tag_query := request.data.get('tag_query')) and isinstance(tag_query, str):
        review_instance_query &= ReviewInstance.search_tags(tag_query)

    # Find review instances that are due
    NUM_FLASHCARDS_PER_LESSON = 25

    due_for_review = ReviewInstance.objects.filter(
        # TODO: adapt for timezones
        review_instance_query & Q(next_review__lte=get_morning())
    ).order_by('next_review')[:NUM_FLASHCARDS_PER_LESSON]

    # If the number of due review instances doesn't meet `NUM_FLASHCARDDS_PER_LESSON`,
    # also send unseen review instances
    num_new_review_instances = NUM_FLASHCARDS_PER_LESSON - due_for_review.count()
    if num_new_review_instances > 0:
        due_for_review |= ReviewInstance.objects.filter(
            review_instance_query & Q(learning_status='UNSEEN')
        )[:num_new_review_instances]

    return Response(
        ReviewInstanceSerializer(
            due_for_review,
            many=True,
            context={'get_flashcard_fields': True},
        ).data,
        status=200,
    )


RI_EDITABLE_ATTRS = {
    'learning_status': str,
    'steps_index': int,
    'ease': int,
    'next_review': str,
    'last_review': str,
}


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def review_instance_update_view(request, review_instance_id, *args, **kwargs) -> dict:
    """
    Updates a review instance after studying it - PUT

    `edited_values`: All editable args
    `utc_timezone_offset` (Data): Num minutes
    `time_taken` (Data): Num milliseconds
    """
    edited_values = request.data.get('edited_values')
    if msg := assert_dict_data_type(edited_values, RI_EDITABLE_ATTRS, False):
        return msg

    ReviewInstance.objects.filter(pk=review_instance_id).update(
        **edited_values,
    )

    request.user.profile.increment_work_done_today(
        cards_done=1,
        utc_timezone_offset=request.data.get('utc_timezone_offset'),
        time_taken=request.data.get('time_taken'),
    )

    return Response({'message': 'Updated review instance'}, status=200)
