import json
import random
import re
import uuid
from typing import List

from django.core.cache import cache
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sharing_system.models import FlashCardAction
from skill_tree.models import AbstractSection, MainSection, SubSection
from utils import (create_slate_element, get_morning,
                   get_paginated_queryset_response, weighted_sample)
from utils.api_utils import get_obj_or_404
from utils.utils import assert_dict_data_type, base64_to_file

from ..models import Deck, FlashCard, ReviewInstance, ReviewInstanceHistory
from ..serializers import (DeckSerializer, FlashCardSerializer,
                           ReviewInstanceSerializer)


# ====== Decks ======
# ===== Deck Lists =====
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
            deck.flashcards.order_by('order_num' if not reverse else '-order_num'),
            request,
            FlashCardSerializer,
            page_size=250
        )


# ===== Deck Import/Export =====
# TODO: rewrite all of these functions
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
                'order_num': flashcard.order_num,
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
            for flashcard in deck.flashcards.order_by('order_num').all()
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
            flashcard_type=json_flashcard.get('flashcard_type', 'BASIC'),
            order_num=json_flashcard.get('order_num', i),
            # Tags
            fields=json_flashcard.get('fields', []),
            tags=json_flashcard.get('tags', ''),
        )
        flashcards_to_create.append(flashcard)

        if json_flashcard.get('review_instances') is None:
            review_instances_to_create += ReviewInstance.create_review_instance(
                json_flashcard.get('flashcard_type', 'BASIC'),
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
    deck, _ = Deck.objects.get_or_create(user=request.user, title=deck_title)

    # Create flashcards
    max_flashcard_num = FlashCard.get_max_order_num(deck)
    flashcards = FlashCard.objects.bulk_create([
        FlashCard(
            deck=deck,
            flashcard_type='BASIC',
            order_num=max_flashcard_num + i + 1,
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
# @api_view(['GET'])
# def deck_search_view(request, *args, **kwargs):
#     """
#     Searches for decks based on a query - GET

#     Required information:
#         `q`: (GET) Query for searching

#     Possible errors:
#         No query: 400, Please specify a query

#     Returns:
#         A list of decks (DeckSerializer)
#     """
#     query = request.GET.get('q')
#     if query is None:
#         return Response({'message': 'Please specify a query'}, status=400)

#     # Attempt to read cached value for query
#     # (spaces will break it, so we need to replace them)
#     CACHE_KEY = f'deck-search-q="{query.replace(" ", "<<SPACE_CHAR>>")}"'
#     sorted_qs = cache.get(CACHE_KEY)

#     if sorted_qs is None:
#         # Get all public decks
#         deck_qs = SharedDeck.objects.filter(sharing_setting='PUBLIC')

#         # Function for calculating how "relevant" each search result is
#         THRESHOLD = 120

#         def sorting_function(deck):
#             return -(
#                 + fuzz.token_set_ratio(query, deck.description) * 1.0
#                 + fuzz.token_set_ratio(query, deck.title) * 2.0
#                 + fuzz.token_set_ratio(query, deck.user.username) * 0.8
#             )

#         # Sort based on function
#         sorted_qs = sorted(
#             [deck for deck in deck_qs if sorting_function(deck) < -THRESHOLD],
#             key=sorting_function,
#         )

#         # Cache result for 6 hours
#         cache.set(CACHE_KEY, sorted_qs, 60*60*6)

#     return get_paginated_queryset_response(sorted_qs, request, SharedDeckSerializer, 5)


# ====== Flashcards ======
# ===== Flashcard Operations =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_create_view(request, *args, **kwargs):
    """
    Create a flashcard to a deck - GET/POST

    Required information:
        `deck_id`: (Data) ID of the deck to create a flashcard in
        `sub_section`: (Data) Subsection to put the flashcard in (a__b)
        `fields`: (Data) List of the fields and their data for the flashcard
        `tags`: (Data) Raw string of tags, separated by commas
        `flashcard_type`: (Data) Type of flashcard
    """
    # Get deck
    deck, resp = get_obj_or_404(Deck, request.data.get('deck_id'), request.user, 'user')
    if resp:
        return resp

    # Get sub section
    try:
        sub_section, _ = AbstractSection.get_from_formatted_title(
            request.data.get('sub_section'),
            deck_id=deck.pk,
        )
    except SubSection.DoesNotExist:
        return Response(
            {'message': 'Subsection not found'},
            status=404,
        )

    fields = request.data.get('fields')
    flashcard_type = request.data.get('flashcard_type', 'BASIC')
    tags = request.data.get('tags', '')
    if fields is None:
        return Response({'message': '`fields` must not be None'}, status=400)

    # Create images
    data_uuid = uuid.uuid4()

    if front_image_base64 := request.data.get('front_image'):
        front_image = base64_to_file(front_image_base64, f'{data_uuid}-front')
        if front_image.size > 1024_000:
            return Response({'message': 'Front image too large'}, status=400)
    else:
        front_image = None

    if back_image_base64 := request.data.get('back_image'):
        back_image = base64_to_file(back_image_base64, f'{data_uuid}-back')
        if back_image.size > 1024_000:
            return Response({'message': 'Back image too large'}, status=400)
    else:
        back_image = None

    # Create flashcard
    flashcard, _ = FlashCard.create(
        sub_section=sub_section,
        tags=tags,
        flashcard_type=flashcard_type,
        fields=fields,
        front_image=front_image,
        back_image=back_image,
        data_uuid=data_uuid,
    )

    # Clear sub section %-complete cache
    sub_section.cached_percent_complete = None
    sub_section.save()

    # Log the flashcard as being created (for sharing system)
    FlashCardAction.create_action(
        action='CREATE',
        flashcard=flashcard,
        deck_id=deck.pk,
    )

    return Response(
        FlashCardSerializer(instance=flashcard).data,
        201,
    )


@api_view(['PUT'])
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
            sub_section__main_section__deck__user_id=request.user.pk,
        )
        data = flashcard.data
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    edited_values = request.data.get('edited_values')
    data.tags = edited_values.get('tags', data.tags)
    new_fields = edited_values.get('fields')

    if new_fields is not None:
        data.fields = new_fields

        # TODO: use this code in pushing/pulling updates with shared deck
        if flashcard.flashcard_type == 'CLOZE':
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

    if new_front_image_bs64 := edited_values.get('front_image'):
        new_front_image = base64_to_file(new_front_image_bs64, f'{data.pk}-front')
        if new_front_image != data.front_image:
            data.front_image = new_front_image

    if new_back_image_bs64 := edited_values.get('back_image'):
        new_back_image = base64_to_file(new_back_image_bs64, f'{data.pk}-back')
        if new_back_image != data.back_image:
            data.back_image = new_back_image

    data.save()

    # Log the flashcard as being edited (for sharing system)
    FlashCardAction.create_action('EDIT', flashcard)

    return Response(FlashCardSerializer(instance=flashcard).data, 200)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcard_list_view(request, *args, **kwargs):
    """
    List flashcards in a deck and/or by section - GET

    `deck_id`? (GET): Id of the deck to get flashcards from
    `section`? (GET): Section to get flashcards from
    """
    flashcard_query = Q()

    if deck_id := request.GET.get('deck_id'):
        flashcard_query &= Q(
            sub_section__main_section__deck__pk=deck_id,
            sub_section__main_section__deck__user_id=request.user.pk,
        )

    if section := request.GET.get('section'):
        section_query, _ = AbstractSection.get_query_from_formatted_title(
            section,
            deck_id,
        )
        flashcard_query &= section_query

    flashcards = FlashCard.objects.filter(flashcard_query)
    return get_paginated_queryset_response(
        flashcards,
        request,
        FlashCardSerializer,
        page_size=250,
    )


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
        query &= ~Q(flashcard__flashcard_type='CLOZE')

    # # See if the "deck" is actually a CSSM
    # try:
    #     cssm = CustomStudySessionManager.objects.get(pk=deck_id, user=request.user.profile)
    # except CustomStudySessionManager.DoesNotExist:
    #     cssm = None

    # if cssm:
    #     query &= cssm.generate_query()
    # else:
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

    flashcards = ReviewInstance.objects.filter(query).prefetch_related('flashcard')

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

    `section` (Data)?: Section to get flashcards from (a__b)
    `study_ahead` (Data)?: If True, return all flashcards, not just non-due ones
    """
    section = request.data.get('section')
    study_ahead = request.data.get('study_ahead')

    # Build base query
    # TODO: re-add cloze flashcards
    review_instance_query = Q(
        flashcard__sub_section__main_section__deck__user=request.user,
    )

    if section:
        section = section.split('__')
        if len(section) == 2:
            review_instance_query &= Q(
                flashcard__sub_section__main_section__data__title__iexact=(
                    AbstractSection.clean(section[0])
                ),
                flashcard__sub_section__data__title__iexact=(
                    AbstractSection.clean(section[1])
                ),
            )
        else:
            review_instance_query &= Q(
                flashcard__sub_section__main_section__data__title__iexact=(
                    AbstractSection.clean(section[0])
                ),
            )

    # Find review instances that are due
    NUM_FLASHCARDS_PER_LESSON = 25

    num_total = ReviewInstance.objects.filter(review_instance_query).count()
    if not study_ahead:
        # TODO: adapt for timezones
        review_instance_query &= Q(next_review__lte=get_morning())

    due_for_review = ReviewInstance.objects\
        .filter(review_instance_query)\
        .prefetch_related('flashcard')\
        .order_by('?' if study_ahead else 'next_review')\
        [:NUM_FLASHCARDS_PER_LESSON]

    # If the number of due review instances doesn't meet `NUM_FLASHCARDDS_PER_LESSON`,
    # also send unseen review instances
    num_new_review_instances = NUM_FLASHCARDS_PER_LESSON - due_for_review.count()
    if num_new_review_instances > 0:
        due_for_review |= ReviewInstance.objects.filter(
            review_instance_query & Q(learning_status='UNSEEN')
        ).prefetch_related('flashcard')[:num_new_review_instances]

    return Response({
        'due_for_review': ReviewInstanceSerializer(
            due_for_review,
            many=True,
            context={'get_flashcard_fields': True},
        ).data,
        'num_total': num_total,
    }, status=200)


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

    Data:
    * `edited_values`: All editable args
    * `utc_timezone_offset`: Num minutes
    * `time_taken`: Num milliseconds
    * `section`: The section that houses the flashcard
    * `deck_id`: The id of the deck the review instance is in
    """
    edited_values = request.data.get('edited_values')
    if msg := assert_dict_data_type(edited_values, RI_EDITABLE_ATTRS, False):
        return msg

    review_instance, error = get_obj_or_404(
        ReviewInstance,
        review_instance_id,
        request.user,
        'flashcard__sub_section__main_section__deck__user',
    )
    if error:
        return error

    time_taken = request.data.get('time_taken')
    ReviewInstanceHistory.objects.create(
        review_instance=review_instance,
        review_instance_backup_id=review_instance.pk,
        grade_response=request.data.get('grade_response'),
        time_taken=time_taken,
        ease=review_instance.ease,
        learning_status=review_instance.learning_status,
        steps_index=review_instance.steps_index,
        next_review=review_instance.next_review,
        last_review=review_instance.last_review,
    )

    for attr, value in edited_values.items():
        setattr(review_instance, attr, value)
    review_instance.save()

    request.user.profile.increment_work_done_today(
        cards_done=1,
        utc_timezone_offset=request.data.get('utc_timezone_offset'),
        time_taken=time_taken,
    )

    section_titles = request.data.get('section')
    deck_id = request.data.get('deck_id')
    if section_titles is not None and deck_id is not None:
        cache_name = f'{deck_id}__{section_titles.replace(" ", "-")}'
        if pk__is_main := cache.get(cache_name):
            pk, is_main = pk__is_main
            if not pk:
                section = None
            else:
                if is_main:
                    section = MainSection.objects.get(pk=pk)
                else:
                    section = SubSection.objects.get(pk=pk)
        else:
            try:
                section, is_main = AbstractSection.get_from_formatted_title(
                    section_titles=section_titles,
                    deck_id=deck_id,
                )
                cache.set(cache_name, (section.pk, is_main), 60*60*24)
            except (SubSection.DoesNotExist, MainSection.DoesNotExist):
                section = None

        if section is not None:
            section.cached_percent_complete = None
            section.save()
            if not is_main:
                section.main_section.cached_percent_complete = None
                section.main_section.save()

    return Response({'message': 'Updated review instance'}, status=200)
