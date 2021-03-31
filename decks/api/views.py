import json
import random
import re
from typing import List

from django.core.cache import cache
from django.db.models import Q, F
from django.utils import timezone
from django.views.decorators.cache import cache_control
from django.views.decorators.vary import vary_on_cookie
# For calculating advanced string similarities (used in searching)
# pip install fuzzywuzzy
# pip install fuzzywuzzy[speedup]
from fuzzywuzzy import fuzz
from profiles.models import Profile
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils import get_paginated_queryset_response, weighted_sample

from ..models import (CustomStudySessionManager, Deck, DeckStudySessionManager,
                      DeckThank, FlashCard, FlashCardCreator, FlashCardField,
                      SharedDeck, StudySessionManager)
from ..serializers import (CustomStudySessionManagerSerializer, DeckSerializer,
                           DeckThankSerializer, FlashCardCreatorSerializer,
                           FlashCardSerializer, SharedDeckSerializer,
                           StudySessionManagerSerializer)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_create_view(request, *args, **kwargs):
    """
    Create a deck - POST

    Required information:
        `title`: (Data) Title of the deck to create
        `shuffle_unseen_cards`: (Data) Whether or not to shuffle unseen cards in the new deck
        `daily_new_card_limit`: (Data) Number of new cards to be done daily in the deck,
        `scheduling_algorithm`: (Data) Scheduling algo for the new deck,
        `difficulty`: (Data) Difficulty of the deck to create

    Returns:
        Author of the deck (PublicProfileSerializer): 'author'
        Title of the deck: 'title'
        ID of the deck: 'id'
    """
    # Get deck title
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'You must specify a title'}, status=400)

    # Create deck
    new_deck = Deck.objects.create(
        user=request.user,
        title=title,
    )

    # Create deck study session manager
    DeckStudySessionManager.objects.create(
        deck=new_deck,
        user=request.user.profile,
        scheduling_algorithm=request.data.get('scheduling_algorithm', 'ANKING'),
        shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', False),
        daily_new_card_limit=request.data.get('daily_new_card_limit', 20),
        difficulty=request.data.get('difficulty', 'HARD'),
    )

    return Response(DeckSerializer(new_deck).data, status=201)


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
    if fields is not None:
        flashcards = FlashCardCreator.create_flashcard(
            deck,
            tags,
            flashcard_type,
            fields,
        )

        return Response(
            FlashCardSerializer(instance=flashcards, many=True).data,
            201,
        )
    else:
        return Response({'message': 'Content must not be None'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_edit_view(request, deck_id, flashcard_num, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard (unused)
        `flashcard_id`: (URL) ID of the flashcard creator we are editing
        `fields`: (Data) List of the fields for the flashcard
        `tags`: (Data) Raw string of tags, separated by commas

    Possible errors:
        Flashcard does not exist or unauthorized: 400, Flashcard not found / you are unauthorized
    """
    # Get the flashcard
    try:
        flashcard = FlashCardCreator.objects.get(
            flashcard_num=flashcard_num,
            deck__pk=deck_id,
            deck__user=request.user,
        )
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Edit the flashcard
    flashcard.tags = request.data.get('tags', '')

    new_fields = request.data.get('fields')
    if new_fields is not None:
        fields = flashcard.fields.all()
        if len(new_fields) == fields.count():
            if flashcard.flashcard_type == 'cloze':
                # Create or delete new flashcards depending on how the cloze has changed
                now = timezone.now()
                this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

                flashcards = flashcard.review_instances.all()
                flashcards_to_create = []
                created_flashcard_cloze_nums = []
                flashcards_to_delete = [fc.id for fc in flashcards]

                # Go through all segments identified as a cloze
                cloze_regex = r"{{c\d*::.*?}}"
                for match in re.finditer(cloze_regex, json.dumps(new_fields[0]), re.MULTILINE):
                    cloze_id = int(match.group().split("::")[0][3:])
                    try:
                        # If the flashcard already exists, mark it as not needing deletion
                        fc = flashcards.get(name=f'cloze-{cloze_id}')
                        try:
                            # The flashcard is still used, so we shouldn't delete it
                            flashcards_to_delete.remove(fc.id)
                        except ValueError:
                            pass
                    except FlashCard.DoesNotExist:
                        # If the flashcard does not exist, create it
                        if cloze_id not in created_flashcard_cloze_nums:
                            created_flashcard_cloze_nums.append(cloze_id)
                            flashcards_to_create.append(
                                FlashCard(
                                    creator=flashcard,
                                    next_review=this_morning,
                                    content_indicies=[0],
                                    name=f'cloze-{cloze_id}'
                                )
                            )

                # Apply delete and create operations
                FlashCard.objects.bulk_create(flashcards_to_create)
                flashcards.filter(id__in=flashcards_to_delete).delete()

            # Update text fields
            _ = (f.text for f in fields)  # for some reason, this line is needed
            for i, text in enumerate(new_fields):
                fields[i].text = text
            FlashCardField.objects.bulk_update(fields, ['text'])
        else:
            return Response({'message': 'Incorrect number of fields specified'}, status=400)

    flashcard.save()
    return Response(FlashCardCreatorSerializer(instance=flashcard).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_delete_view(request, deck_id, flashcard_num, *args, **kwargs):
    """
    Deletes a flashcard - POST

    Required information:
        `deck_id`: (URL) The ID of the deck in which the flashcard is located
        `flashcard_id`: (URL) The ID of the flashcard creator to delete

    Returns:
        `message`: Flashcard deleted successfully
        `status`: 200
    """
    # Get the flashcard
    try:
        flashcard = FlashCardCreator.objects.get(
            flashcard_num=flashcard_num,
            deck__pk=deck_id,
            deck__user=request.user,
        )
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Delete the flashcard
    flashcard.delete()

    # Rearrange all flashcards to fill in the missing gap
    FlashCardCreator.objects.filter(
        deck__pk=deck_id,
        flashcard_num__gt=flashcard.flashcard_num,
    ).update(flashcard_num=F('flashcard_num') - 1)

    return Response({'message': 'Flashcard deleted succesfully'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcard_detail_view(request, deck_id, flashcard_num, *args, **kwargs):
    try:
        flashcard = FlashCardCreator.objects.get(
            flashcard_num=flashcard_num,
            deck__pk=deck_id,
            deck__user=request.user,
        )
    except FlashCardCreator.DoesNotExist:
        return Response(
            {'message': 'Flashcard not found / you are unauthorized'},
            status=404,
        )

    return Response(FlashCardCreatorSerializer(flashcard).data)


@api_view(['GET'])
@vary_on_cookie
@cache_control(private=True)
def deck_shared_view(request, username, *args, **kwargs):
    """
    Gets decks from a user that are either shared with the requester or public - GET

    Required information:
        `username`: (URL) Username of the user to get decks from

    Returns:
        A list of decks (DeckSerializer)
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
            Q(user=profile.user) &
            (Q(sharing_setting='PUBLIC') | Q(sharing_setting='FRIENDS'))
        )
    else:
        decks_qs = SharedDeck.objects.filter(user=profile.user, sharing_setting='PUBLIC')

    return Response(SharedDeckSerializer(decks_qs, many=True).data, status=200)


@vary_on_cookie
@cache_control(private=True)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_private_list(request, *args, **kwargs):
    """
    Gets a list of the current user's private decks - GET

    Parameters:
        `include_cssms`: (GET) Whether or not to include CSSMs
    """
    include_cssms = request.GET.get('include_cssms')

    decks = Deck.objects.filter(
        user=request.user,
        deck_type='standard',
    ).order_by('title')
    deck_data = DeckSerializer(decks, many=True).data

    if include_cssms and include_cssms.lower() == 'true':
        cssms = CustomStudySessionManager.objects.filter(
            user=request.user.profile
        )
        cssm_data = CustomStudySessionManagerSerializer(cssms, many=True).data
        data = deck_data + cssm_data
    else:
        data = deck_data

    return Response(
        data,
        status=200,
    )


@api_view(['GET'])
def deck_detail_view(request, deck_id, *args, **kwargs):
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
        deck = SharedDeck.objects.get(pk=deck_id)
    except SharedDeck.DoesNotExist:
        try:
            deck = Deck.objects.get(pk=deck_id)
        except Deck.DoesNotExist:
            return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not deck.user_has_access(request.user):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    Serializer = SharedDeckSerializer if isinstance(deck, SharedDeck) else DeckSerializer
    return Response(Serializer(deck, context={'request': request}).data, status=200)


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
        serializer = FlashCardCreatorSerializer(
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
            FlashCardCreatorSerializer,
            page_size=250
        )


@api_view(['DELETE', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_delete_view(request, deck_id, *args, **kwargs):
    """
    Deletes a deck - DELETE/POST

    Required information:
        `deck_id`: (URL) The ID of the deck to be deleted
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found / you are unauthorized'}, status=400)

    # Delete
    deck.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_edit_view(request, deck_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard
        `new_title`: (Data) New title of the deck
        `scheduling_algorithm`: (Data) Which scheduling algorithm to use, ANKI or ANKING
        `shufle_unseen_cards`: (Data) Whether or not to shuffle unseen cards
        `difficulty`: (Data) New difficulty of the deck, HARD, NORM, or EASY
        `daily_new_card_limit`: (Data) New value for the # of unseen flashcards to show
        `daily_seen_card_limit`: (Data) New value for the # of seen flashcards to show
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found / you are unauthorized'}, status=400)

    # Get data
    scheduling_algorithm = request.data.get(
        'scheduling_algorithm',
        deck.study_session_manager.scheduling_algorithm,
    )

    if scheduling_algorithm not in ('ANKI', 'ANKING'):
        return Response(
            {'message': 'Invalid `scheduling_algorithm`.  Must be `ANKI` or `ANKING`'},
            status=400,
        )

    # Edit the deck
    deck.title = request.data.get('new_title', deck.title)
    deck.study_session_manager.scheduling_algorithm = scheduling_algorithm
    deck.study_session_manager.shuffle_unseen_cards = request.data.get(
        'shuffle_unseen_cards',
        deck.study_session_manager.shuffle_unseen_cards,
    )
    deck.study_session_manager.daily_new_card_limit = request.data.get(
        'daily_new_card_limit',
        deck.study_session_manager.daily_new_card_limit,
    )
    deck.study_session_manager.daily_seen_card_limit = request.data.get(
        'daily_seen_card_limit',
        deck.study_session_manager.daily_seen_card_limit,
    )
    deck.study_session_manager.review_ahead_minutes = request.data.get(
        'review_ahead_minutes',
        deck.study_session_manager.review_ahead_minutes,
    )
    deck.study_session_manager.difficulty = request.data.get(
        'difficulty',
        deck.study_session_manager.difficulty,
    )

    deck.save()
    deck.study_session_manager.save()
    return Response(DeckSerializer(instance=deck).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_thank_view(request, deck_id, *args, **kwargs):
    """
    Create a thank object for a deck - POST

    Required information:
        `deck_id`: (URL) ID of the get to thank

    Possible errors:
        Invalid deck ID: 404, Deck not found
        Attempt to thank self: 400, You cannot thank yourself
        Already thanked: 400, You have already thanked this deck
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Check that the user is not thanking themselves
    if deck.user == request.user:
        return Response({'message': 'You cannot thank yourself'}, status=400)

    # Create thank object
    new_thank, created = DeckThank.objects.get_or_create(deck=deck, profile=request.user.profile)
    if not created:
        return Response({'message': 'You have already thanked this deck'}, status=400)

    # Increment total thanks of the deck's author
    deck.user.profile.increment_total_thanks_recieved()

    return Response(DeckThankSerializer(new_thank).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_suspend_leech_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Set a flashcard as suspended or unsuspended - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which the card is located
        `flashcard_id`: (URL) ID of the flashcard to (un)suspend/leech
        `action`: (Data) Either 'suspend', 'unsuspend', 'leech', or 'unleech'
    """
    # Check action is specified
    if not request.data.get('action'):
        return Response({'message': 'Please specify an action'}, status=400)

    # Get flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, creator__deck__user=request.user)
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=404)

    # Set flashcard as (un)suspended/leeched
    action = request.data.get('action')
    if action in ('suspend', 'unsuspend'):
        flashcard.is_suspended = (action == 'suspend')
    elif action in ('leech', 'unleech'):
        flashcard.set_is_leech(action == 'leech')
    flashcard.save()

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
    flashcard_qs = FlashCard.search_flashcards(
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

    return Response(FlashCardSerializer(flashcard_qs, many=True).data, status=200)


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
                + (deck.thanks.count() + 1) * 0.005
            )

        # Sort based on function
        sorted_qs = sorted(
            [deck for deck in deck_qs if sorting_function(deck) < -THRESHOLD],
            key=sorting_function,
        )

        # Cache result for 6 hours
        cache.set(CACHE_KEY, sorted_qs, 60*60*6)

    return get_paginated_queryset_response(sorted_qs, request, SharedDeckSerializer, 5)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def txt_file_upload(request, *args, **kwargs):
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
    if created:
        DeckStudySessionManager.objects.create(
            deck=deck,
            user=request.user.profile,
        )

    # Create flashcards
    max_flashcard_num = FlashCardCreator.get_max_creator_num(deck)
    creators = FlashCardCreator.objects.bulk_create([
        FlashCardCreator(
            deck=deck,
            flashcard_type='basic',
            flashcard_num=max_flashcard_num + i + 1,
        )
        for i in range(len(front_and_back))
    ])
    FlashCardField.objects.bulk_create([
        FlashCardField(
            creator=creator,
            text=[{"type": "paragraph", "children": [{"text": front_and_back[i][num]}]}],
            field_number=num,
        )
        for i, creator in enumerate(creators) for num in range(2)
    ])
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)
    FlashCard.objects.bulk_create([
        FlashCard(
            creator=creator,
            next_review=this_morning,
            content_indicies=[0, 1],
        )
        for creator in creators
    ])

    return Response(DeckSerializer(deck).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ssm_flashcards_view(request, ssm_id, *args, **kwargs):
    """
    Gets the due flashcards from a SSM - GET

    Required information:
        `ssm_id`: (URL) ID of the study session manager

    Possible errors:
        SSM does not exist: 404, SSM does not exist
    """
    try:
        ssm = DeckStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
    except DeckStudySessionManager.DoesNotExist:
        try:
            ssm = CustomStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
        except CustomStudySessionManager.DoesNotExist:
            return Response({'message': f'SSM #{ssm_id} does not exist for {request.user.username}'}, status=404)

    seen_flashcards, unseen_flashcards = ssm.get_flashcards()
    flashcards = ssm.get_reviews(seen_flashcards, unseen_flashcards)

    return Response(
        FlashCardSerializer(flashcards, many=True).data,
        status=200,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ssm_detail_view(request, ssm_id, *args, **kwargs):
    """
    Gets information about a study session manager - GET
    Required information:
        `ssm_id`: (URL) ID of the study session manager

    Possible errors:
        SSM does not exist: 404, SSM does not exist
    """
    try:
        ssm = StudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
    except StudySessionManager.DoesNotExist:
        return Response({'message': 'SSM does not exist'}, status=404)

    return Response(StudySessionManagerSerializer(ssm).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ssm_flashcard_update_view(request, ssm_id, flashcard_id, *args, **kwargs):
    """
    Update a flashcard's review information - POST

    Required information:
        `ssm_id`: (URL) ID of the study session manager
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `next_review`: (Data) ISO string date for next review
        `learning_status`: (Data) Learning status of the card
        `ease`: (Data) Ease of card
        `interval`: (Data) The new interval for the flashcard
        `increment_new_cards_done_today`: (Data) Whether or not to increment the SSM's `new_cards_done_today` attribute
            If False, will increment `seen_cards_done_today` instead
        `utc_timezone_offset`: (Data) (Optional) UTC timezone offset used to mark date for completing flashcard
        `time_taken`: (Data) (Optional) Time in ms required to answer the flashcard

    Possible errors:
        SSM does not exist: 404, SSM not found
        Current user does not own SSM: 401, You are not authorized to edit this SSM
        Flashcard does not exist: 404, Flashcard not found
    """
    # Get the SSM
    try:
        ssm = StudySessionManager.objects.get(pk=ssm_id)
    except StudySessionManager.DoesNotExist:
        return Response({'message': 'SSM not found / you are unauthorized'}, status=400)

    # Get the flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, creator__deck__user=request.user)
    except FlashCard.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Edit the flashcard
    flashcard.next_review = request.data.get('next_review', flashcard.next_review)
    flashcard.learning_status = request.data.get('learning_status', flashcard.learning_status).upper()
    flashcard.interval = request.data.get('interval', flashcard.interval)
    flashcard.ease = request.data.get('ease', flashcard.ease)
    flashcard.steps_index = request.data.get('steps_index', flashcard.steps_index)
    flashcard.leech_index = request.data.get('leech_index', flashcard.leech_index)
    flashcard.set_is_leech(request.data.get('is_leech', flashcard.is_leech), save=False)
    flashcard.save()

    # Increment the number of cards that the profile and SSM are registed as doing today
    flashcard.creator.deck.user.profile.increment_cards_done_today(
        request.data.get('utc_timezone_offset'),
        request.data.get('time_taken'),
    )

    if request.data.get('increment_new_cards_done_today'):
        ssm.new_cards_done_today += 1
    else:
        ssm.seen_cards_done_today += 1
    ssm.save()

    return Response(FlashCardSerializer(instance=flashcard).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ssm_edit_view(request, ssm_id, *args, **kwargs):
    """
    Edit a study session manager - POST

    Required information:
        `ssm_id`: (URL) ID of the SSM to edit
        `title`
        `scheduling_algorithm`
        `shuffle_unseen_cards`
        `daily_new_card_limit`
        All other CSSM information

    Possible errors:
        SSM does not exist, 400: SSM does not exist / you are unauthorized
        Try to edit title on deck ssm: 400, This SSM does not support that feature
        """
    try:
        ssm = DeckStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
    except DeckStudySessionManager.DoesNotExist:
        try:
            ssm = CustomStudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
        except CustomStudySessionManager.DoesNotExist:
            return Response(
                {'message': f'SSM #{ssm_id} does not exist for {request.user.username}'}
                , status=404,
            )

    if isinstance(ssm, CustomStudySessionManager):
        # For CSSMs
        ssm.title = request.data.get('title', ssm.title)
        ssm.deck_ids = str(request.data.get(
            'deck_ids',
            ssm.deck_ids,
        )).replace('[', '').replace(']', '').replace(' ', '')
        ssm.tags = request.data.get('tags', ssm.tags)
        ssm.contains = request.data.get('contains', ssm.contains)
        ssm.leech = request.data.get('leech', ssm.leech)
        ssm.learning_status = request.data.get('learning_status', ssm.learning_status)
        ssm.min_ease = request.data.get('min_ease', ssm.min_ease)
        ssm.max_ease = request.data.get('max_ease', ssm.max_ease)

    # For all SSMs
    ssm.scheduling_algorithm = request.data.get('scheduling_algorithm', ssm.scheduling_algorithm)
    ssm.shuffle_unseen_cards = request.data.get('shuffle_unseen_cards', ssm.shuffle_unseen_cards)
    ssm.daily_new_card_limit = request.data.get('daily_new_card_limit', ssm.daily_new_card_limit)
    ssm.review_ahead_minutes = request.data.get('review_ahead_minutes', ssm.review_ahead_minutes)

    ssm.save()
    return Response(StudySessionManagerSerializer(ssm).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ssm_delete_view(request, ssm_id, *args, **kwargs):
    """
    Delete a study session manager - POST

    Required information:
        `ssm_id`: (URL) ID of the SSM to edit

    Possible errors:
        SSM does not exist, 400: SSM does not exist / you are unauthorized
    """
    try:
        ssm = StudySessionManager.objects.get(pk=ssm_id, user=request.user.profile)
        ssm.delete()
        return Response({'message': 'SSM deleted'}, status=200)
    except StudySessionManager.DoesNotExist:
        return Response({'message': 'SSM does not exist / you are unauthorized, 400: SSM does not exist / you are unauthorized'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ssm_create_view(request, *args, **kwargs):
    """
    Creates a (custom) study session manager - POST
    """
    ssm = CustomStudySessionManager.objects.create(
        user=request.user.profile,
        title=request.data.get('title', f'New Custom Study - {random.randint(0, 1000)}'),
        deck_ids=str(request.data.get('deck_ids')).replace('[', '').replace(']', '').replace(' ', ''),
        tags=request.data.get('tags', ''),
        contains=request.data.get('contains', ''),
        leech=request.data.get('leech', ''),
        learning_status=request.data.get('learning_status', ''),
        min_ease=request.data.get('min_ease', 130),
        max_ease=request.data.get('max_ease', 350),
    )

    return Response(CustomStudySessionManagerSerializer(ssm).data, status=201)


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
        `destination_deck_title`: (Data) Title of the deck to clone into (this can also be a new title) 
    """
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
        if shared_deck.sharing_setting == 'FRIENDS' and request.user not in shared_deck.user.friends:
            return Response({'message': 'You are unauthorized to clone this deck'}, status=403)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    deck = shared_deck.clone(
        request.user,
        request.data.get('destination_deck_title'),
        request.data,
    )

    return Response(DeckSerializer(deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_edit_view(request, shared_deck_id, *args, **kwargs):
    """
    Edits the metadata of a shared deck - POST

    Required information:
        `new_title`: New title of the deck
        `new_description`: New description of the deck
        `new_sharing_setting`: New sharing setting of the deck
    """
    # Get shared deck
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Could not find the specified shared deck'}, status=404)

    # Update shared deck
    shared_deck.title = request.data.get('new_title', shared_deck.title) 
    shared_deck.description = request.data.get('new_description', shared_deck.description)
    shared_deck.sharing_setting = request.data.get('new_sharing_setting', shared_deck.sharing_setting)
    shared_deck.save()

    return Response(SharedDeckSerializer(shared_deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_update_view(request, *args, **kwargs):
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
            pk=request.data.get('shared_deck_id'),
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
        return Response({'message': 'Deck does not exist / you are unauthorized'}, status=400)

    # Get shared deck
    to_pull_from = request.data.get('to_pull_from')
    try:
        shared_deck = SharedDeck.objects.get(pk=to_pull_from)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck does not exist / you are unauthorized'}, status=400)

    deck = deck.pull_updates(shared_deck)

    return Response(DeckSerializer(deck).data, status=200)


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
        return Response({'message': f'You must specify `type`, `deck_id`, and `amount`: {method_type}, {deck_id}, {amount}'}, status=400)

    query = Q(creator__deck__user=request.user) & ~Q(creator__flashcard_type='cloze')

    # See if the "deck" is actually a CSSM
    try:
        cssm = CustomStudySessionManager.objects.get(pk=deck_id, user=request.user.profile)
    except CustomStudySessionManager.DoesNotExist:
        cssm = None

    if cssm:
        query &= FlashCard.search_flashcards(
            request.user,
            cssm.deck_ids,
            cssm.tags,
            cssm.contains,
            False,  # suspended (can't study suspended cards)
            cssm.leech,
            None,  # learning status is specified above
            cssm.min_ease,
            cssm.max_ease,
            return_query_only=True,
        )
    else:
        query &= Q(creator__deck__id=deck_id)

    # Get the list of all possible flashcards, based on the method type
    if method_type == 'SEEN' or method_type == 'PERSONAL':
        query &= ~Q(learning_status='UNSEEN')
    elif method_type == 'UNSEEN':
        query &= Q(learning_status='UNSEEN')
    elif method_type == 'TAG':
        query &= FlashCard.search_tags(
            request.data.get('options').get('tag'),
        )
    elif method_type == 'ALL':
        pass
    else:
        return Response({'message': 'Unrecognized method for getting flashcards'}, status=400)

    flashcards = FlashCard.objects.filter(query)

    # Get `amount` random flashcards from the list
    if method_type == 'PERSONAL':
        flashcard_weights = [(350 - flashcard.ease)**2 for flashcard in flashcards] # 350 = max ease
        flashcards = weighted_sample(list(flashcards), flashcard_weights, amount)
    elif request.data.get('random_order'):
        flashcard_ids = flashcards.values_list('id', flat=True)
        random_flashcard_ids = random.sample(list(flashcard_ids), min(flashcards.count(), amount))
        flashcards = FlashCard.objects.filter(pk__in=random_flashcard_ids)
    else:
        flashcards = flashcards[:amount]

    return Response(FlashCardSerializer(flashcards, many=True).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rearrange_flashcard_view(request, deck_id, flashcard_num, *args, **kwargs):
    """
    Rearranges flashcards - POST

    Required information:
        `flashcard_id`: Id of the FlashCardCreator to rearrange
        `rearrange_type`: Way to rearrange the flashcard
            'UP': Decrease the flashcard's number
            'DOWN': Increase the flashcard's number
    """
    try:
        flashcard = FlashCardCreator.objects.get(
            flashcard_num=flashcard_num,
            deck__pk=deck_id,
            deck__user=request.user,
        )
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard creator not found'}, status=404)

    rearrange_type = request.data.get('rearrange_type')
    msg = flashcard.rearrange(rearrange_type)
    if msg is not None:
        return Response({'message': msg}, status=400)

    return Response(FlashCardCreatorSerializer(flashcard).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def edit_tags_bulk_view(request, *args, **kwargs):
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

    flashcards = FlashCardCreator.objects.filter(
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
        return Response({'message': 'Will be implemented soon'}, status=501)

    FlashCardCreator.objects.bulk_update(flashcards, ['tags'])
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

    flashcards = FlashCard.objects.filter(
        creator__deck__user=request.user,
        pk__in=flashcard_ids,
    )
    if flashcards.count() != len(flashcard_ids):
        return Response({'message': 'Could not find all flashcards specified'}, status=400)

    if action == 'SUSPEND':
        flashcards.update(is_suspended=True)
    elif action == 'UNSUSPEND':
        flashcards.update(is_suspended=False)
    elif action == 'DELETE':
        # Delete creators (and review instances, by cascade) (never just delete review instances)
        creators = FlashCardCreator.objects.filter(review_instances__in=flashcards)
        creators.delete()
    else:
        return Response({'message': 'Invalid action'}, status=400)

    return Response({'message': 'Edited flashcard review instances'}, status=200)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_quick_list_view(request, *args, **kwargs):
    """
    Gets a minified list of decks and their progress for use on the main homepage - GET

    Parameters:
        calc_percent_complete=False: (GET) Whether or not to calc the percent complete for each deck
        include_has_shared_deck=False: (GET) Whether or not to include decks that have been shared
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

    flashcards = FlashCard.objects.filter(
        creator__deck__in=decks,
    )

    # calc = request.user.profile.settings.user_type != 'TEACHER'
    calc = request.GET.get('calc_percent_complete', False)
    data = [
        {
            'title': deck.title,
            'id': deck.pk,
            'percent_complete': deck.calc_percent_complete(flashcards) if calc else None,  # TODO: this results in a DB hit `len(decks)` times
        }
        for deck in decks
    ]

    return Response(data, status=200)
