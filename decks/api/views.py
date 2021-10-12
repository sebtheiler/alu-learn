import json
import random
import re
import uuid
from typing import List

from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sharing_system.models import FlashCardAction
from skill_tree.models import AbstractSection, SubSection
from utils import (create_slate_element, get_morning,
                   get_paginated_queryset_response, weighted_sample)
from utils.api_utils import get_obj_or_404
from utils.utils import assert_dict_data_type, base64_to_file

from ..models import Deck, FlashCard, FlashCardData, ReviewInstance, ReviewInstanceHistory
from ..serializers import (DeckSerializer, FlashCardSerializer,
                           ReviewInstanceSerializer)


# ====== Decks ======
# ===== Deck Lists =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_list(request):
    decks = Deck.objects.filter(
        user=request.user,
        is_archived=request.GET.get('is_archived', 'false').lower() == 'true',
    ).prefetch_related(
        'user',
        'main_sections__sub_sections',
    )

    return Response(DeckSerializer(decks, many=True).data, status=200)


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

    if None in (deck_title, uploaded_file):
        return Response(
            {'message': 'You must specify `deck_title` and `uploaded_file`'},
            status=400,
        )

    # Parse text document
    split_lines = uploaded_file.split('\n')
    front_and_back = [line.split('\t') for line in split_lines if line]

    # Get/create deck with given title
    deck = Deck.objects.create(
        user=request.user,
        title=deck_title,
    )
    main_section = deck.main_sections.first()
    sub_section = main_section.sub_sections.first()

    # Create flashcards
    flashcards = []
    flashcards_data = []
    for i in range(len(front_and_back)):
        flashcard_data = FlashCardData(
            tags='',
            fields=[
                create_slate_element(front_and_back[i][0]),
                create_slate_element(front_and_back[i][1]),
            ],
            pk=uuid.uuid4(),
        )
        flashcards_data.append(flashcard_data)

        flashcard = FlashCard(
            sub_section=sub_section,
            flashcard_type='BASIC',
            order_num=i,
            data=flashcard_data,
        )
        flashcards.append(flashcard)

    flashcards_data = FlashCardData.objects.bulk_create(flashcards_data)
    flashcards = FlashCard.objects.bulk_create(flashcards)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_deck(request, deck_id):
    is_archived = request.data.get('is_archived')
    if not isinstance(is_archived, bool):
        return Response({'message': '`is_archived` must be a bool'}, status=400)

    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    deck.is_archived = is_archived
    deck.save()

    return Response(deck.get_statistics(), status=200)


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
    except (MainSection.DoesNotExist, SubSection.DoesNotExist):
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_search_view(request, *args, **kwargs):
    # Currently only allows for searching in fields
    contains_text = request.data.get('contains_text')

    flashcards = FlashCard.objects.filter(
        data__fields__icontains=contains_text,
        sub_section__main_section__deck__user_id=request.user.pk,
    )

    return get_paginated_queryset_response(flashcards, request, FlashCardSerializer)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def find_universal_flashcard(request, universal_flashcard_id, *args, **kwargs):
    try:
        flashcard = FlashCard.objects.get(
            Q(sub_section__main_section__deck__user_id=request.user.pk) &
            (
                Q(universal_flashcard_id=universal_flashcard_id)
                |
                Q(pk=universal_flashcard_id)
            )
        )
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found'}, status=404)

    return Response(FlashCardSerializer(flashcard).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def review_instance_search_view(request, *args, **kwargs):
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

    query = Q(
        flashcard__sub_section__main_section__deck__user=request.user,
        flashcard__sub_section__main_section__deck_id=deck_id,
    )
    if not request.data.get('options').get('include_cloze'):
        query &= ~Q(flashcard__flashcard_type='CLOZE')

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
    deck_id = request.data.get('deck_id')
    study_ahead = request.data.get('study_ahead')

    # Build base query
    review_instance_query = Q(flashcard__sub_section__main_section__deck__user=request.user)

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

    if deck_id:
        review_instance_query &= Q(flashcard__sub_section__main_section__deck_id=deck_id)

    # Find review instances that are due
    NUM_FLASHCARDS_PER_LESSON = 25

    num_total = ReviewInstance.objects.filter(review_instance_query).count()
    if not study_ahead:
        # TODO: adapt for timezones
        review_instance_query &= Q(next_review__lte=get_morning())

    due_for_review = ReviewInstance.objects\
        .filter(review_instance_query)\
        .prefetch_related('flashcard')\
        .order_by('?' if study_ahead else 'next_review')[:NUM_FLASHCARDS_PER_LESSON]

    # If the number of due review instances doesn't meet `NUM_FLASHCARDS_PER_LESSON`,
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
def review_instance_update_view(request, review_instance_id) -> dict:
    """
    Updates a review instance after studying it - PUT

    Data:
    * `edited_values`: All editable args
    * `utc_timezone_offset`: Num minutes
    * `time_taken`: Num milliseconds
    * `section`: The section that houses the flashcard
    * `deck_id`: The ID of the deck the review instance is in
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

    sub_section = review_instance.flashcard.sub_section
    if sub_section.cached_percent_complete is not None:
        sub_section.cached_percent_complete = None
        sub_section.cached_total_percent_complete = None
        sub_section.save()

        main_section = sub_section.main_section
        main_section.cached_percent_complete = None
        main_section.cached_total_percent_complete = None
        main_section.save()

    return Response({'message': 'Updated review instance'}, status=200)
