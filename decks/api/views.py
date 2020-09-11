from django.conf import settings
from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.utils import timezone
from django.db.models import Q
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.cache import cache_page, cache_control
from django.views.decorators.vary import vary_on_cookie

from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..forms import DeckForm
from ..models import Deck, FlashCard, DeckThank
from ..serializers import DeckSerializer, FlashCardSerializer, DeckThankSerializer
from .utils import get_paginated_queryset_response
from profiles.models import Profile

import re
# For calculating advanced string similarities (used in searching)
# pip install fuzzywuzzy
# pip install fuzzywuzzy[speedup]
from fuzzywuzzy import process, fuzz

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_create_view(request, *args, **kwargs):
    """
    Create a deck - POST

    Required information:
        `title`: (Data) Title of the deck to create
        `description`: (Data) Description fo the deck to create
        `sharing_setting`: (Data) Sharing setting of the new deck
        `shuffle_unseen_cards`: (Data) Whether or not to shuffle unseen cards in the new deck
        `daily_new_card_limit`: (Data) Number of new cards to be done daily in the deck,
        `scheduling_algorithm`: (Data) Scheduling algo for the new deck,

    Returns:
        Author of the deck (PublicProfileSerializer): 'author'
        Title of the deck: 'title'
        ID of the deck: 'id'
    """
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'You must specify a title'}, status=400)

    new_deck = Deck.objects.create(
        user=request.user,
        title=title,
        description=request.data.get('description', ''),
        sharing_setting=request.data.get('sharing_setting', 'PRIVATE'),
        scheduling_algorithm=request.data.get('scheduling_algorithm', 'ANKI'),
        shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', False),
    )

    return Response(DeckSerializer(new_deck).data, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def flashcard_create_view(request, deck_id, *args, **kwargs):
    """
    Create a flashcard to a deck - GET/POST

    Required information:
        `deck_id`: (URL) ID of the deck to create a flashcard in
        `front_text`: (Data) Text to go on the front of the flashcard
        `back_text`: (Data) Text to go on the back of the flashcard
        `tags`: (Data) Raw string of tags, separated by commas
    
    Possible errors:
        Deck ID does not exist or the user is unauthenticated: 400, Deck not found / unauthorized
        Front/back text is None: 400, Front and back text must not be None
    """
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found / unauthorized'}, status=400)

    front_text = request.data.get('front_text')
    back_text = request.data.get('back_text')
    tags = request.data.get('tags')
    if front_text is not None and back_text is not None:
        now = timezone.now()
        this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)
        created = FlashCard.objects.create(
            deck=deck,
            front_text=front_text,
            back_text=back_text,
            tags=tags if tags else '',
            next_review=this_morning,
        )
        return Response(FlashCardSerializer(instance=created).data, 201)
    return Response({'message': 'Front and back text must not be None'}, 400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard (unused)
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `front_text`: (Data) What to set the front text to
        `back_text`: (Data) What to set the back text to
        `tags`: (Data) Raw string of tags, separated by commas

    Possible errors:
        Current user does not own deck: 401, You are not authorized to edit this flashcard
        Flashcard does not exist: 400, Flashcard not found / you are unauthorized
    """
    # Get the flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, deck__user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Edit the flashcard
    flashcard.front_text = request.data.get('front_text')
    flashcard.back_text = request.data.get('back_text')
    flashcard.tags = request.data.get('tags', '')
    flashcard.save()

    return Response(FlashCardSerializer(instance=flashcard).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_review_update_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Update a flashcard's review information - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard (unused)
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `date`: (Data) ISO string date for next review
        `learning_status`: (Data) Learning status of the card, either 'UNSEEN', 'LEARNING', 'LEARNED', or 'RELEARNING'
        `ease` Ease of card
        `interval`: The new interval for the flashcard
        `increment_new_cards_done_today`: Whether or not to increment the parent deck's new_cards_done_today` attribute

    Possible errors:
        Deck does not exist: 404, Deck not found
        Current user does not own deck: 401, You are not authorized to edit this flashcard
        Flashcard does not exist: 404, Flashcard not found
    """
    # Get the flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, deck__user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Edit the flashcard
    flashcard.next_review = request.data.get('next_review', flashcard.next_review)
    flashcard.learning_status = request.data.get('learning_status', flashcard.learning_status).upper()
    flashcard.interval = request.data.get('interval', flashcard.interval)
    flashcard.steps_index = request.data.get('steps_index', flashcard.steps_index)
    flashcard.leech_index = request.data.get('leech_index', flashcard.leech_index)
    flashcard.set_is_leech(request.data.get('is_leech', flashcard.is_leech), save=False)
    flashcard.save()

    # Increment the number of cards that the profile is registed as doing today
    flashcard.deck.user.profile.increment_cards_done_today()
    increment_new_cards_done_today = request.data.get('increment_new_cards_done_today')
    if increment_new_cards_done_today:
        flashcard.deck.new_cards_done_today += 1
        flashcard.deck.save()

    return Response(FlashCardSerializer(instance=flashcard).data, 200)



@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def flashcard_delete_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Deletes a flashcard - DELETE/POST

    Required information:
        `deck_id`: (URL) The ID of the deck in which the flashcard is located
        `flashcard_id`: (URL) The ID of the flashcard to delete
    
    Returns:
        `message`: Flashcard deleted successfully
        `status`: 200
    
    Possible errors:
        Current user does not own deck: 401, You are not authorized to delete this deck
        Flashcard does not exist or user does not own it: 400, Flashcard not found / you are unauthorized
    """
    # Get the flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, deck__user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Delete the flashcard
    flashcard.delete()
    return Response({'message': 'Flashcard deleted succesfully'}, status=200)


@api_view(['GET'])
def flashcard_detail_view(request, deck_id, flashcard_id, *args, **kwargs): # TODO: fix things, need to check if friend also
    """
    Get specific information about a deck - GET

    Required information:
        `deck_id`: (URL) The ID of the deck
        `flashcard_id`: (URL) The ID of the flashcard

    Returns:
        Front text of the flashcard: 'front_text'
        Back text of the flashcard: 'back_text'
        ID of the flashcard: 'id'
    
    Possible errors:
        Invalid deck: 404, Deck not found
        Invalid flashcard: 404, Flashcard not found
    """
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    deck = decks_qs.first()
    flashcard_qs = deck.flashcards.filter(pk=flashcard_id)
    if not flashcard_qs.exists():
        return Response({'message': 'Flashcard not found'}, status=404)
    serializer = FlashCardSerializer(flashcard_qs.first())
    return Response(serializer.data)


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
    except ObjectDoesNotExist:
        return Response({'message': f'Invalid username "{username}"'}, status=404)

    # Get user's decks that are either public or shared
    if profile.user == request.user:
        # If the user is viewing their own decks, just return everything
        return Response(DeckSerializer(Deck.objects.filter(user=profile.user), many=True).data, status=200)

    is_friend = request.user in profile.friends.all()
    if is_friend:
        decks_qs = Deck.objects.filter(Q(user=profile.user) & (Q(sharing_setting='PUBLIC') | Q(sharing_setting='FRIENDS')))
    else:
        decks_qs = Deck.objects.filter(user=profile.user, sharing_setting='PUBLIC')

    return Response(DeckSerializer(decks_qs, many=True).data, status=200)


@vary_on_cookie
@cache_control(private=True)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_home_view(request, *args, **kwargs):
    """
    Gets a homepage list of decks for a logged-in user - GET

    Returns:
        A list of decks (DeckSerializer)
    """
    home_qs = Deck.objects.home(request.user)
    return get_paginated_queryset_response(home_qs, request, DeckSerializer, page_size=50)


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
        deck = Deck.objects.get(pk=deck_id)
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not (request.user == deck.user or deck.sharing_setting == 'PUBLIC' or (deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all())):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    # Return
    serializer = DeckSerializer(deck, context={'request': request})
    return Response(serializer.data, status=200)

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
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not (request.user == deck.user or deck.sharing_setting == 'PUBLIC' or (deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all())):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    limit = request.GET.get('limit')
    if limit:
        serializer = FlashCardSerializer(deck.flashcards.all()[:int(limit)], context={'request': request}, many=True)
        return Response({
            'results': serializer.data,
            'count': deck.flashcards.count(),
        })
    else:
        # TODO: PAGINATE
        serializer = FlashCardSerializer(deck.flashcards, context={'request': request}, many=True)
        return Response(serializer.data, status=200)

@api_view(['DELETE', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_delete_view(request, deck_id, *args, **kwargs):
    """
    Deletes a deck - DELETE/POST

    Required information:
        `deck_id`: (URL) The ID of the deck to be deleted
    
    Returns:
        `message`: Deck deleted successfully
        `status`: 200
    
    Possible errors:
        Current user does not own deck or deck ID is invalid: 400, Deck not found / you are unauthorized
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found / you are unauthorized'}, status=400)

    # Delete
    deck.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)


@api_view(['POST'])
# @authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_edit_view(request, deck_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard
        `new_title`: (Data) New title of the deck
        `description`: (Data) New description of the deck
        `sharing_setting`: (Data) PRIVATE, FRIENDS, or PUBLIC
        `scheduling_algorithm`: (Data) Which scheduling algorithm to use, ANKI or ANKING
        `shufle_unseen_cards`: (Data) Whether or not to shuffle unseen cards

    Possible errors:
        Deck does not exist or user is unauthorized: 404, Deck not found / you are unauthorized
        Invalid sharing setting (if specified): 400, Invalid `sharing_setting`.  Must be `PRIVATE`, `FRIENDS`, or `PUBLIC`
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found / you are unauthorized'}, status=400)

    # Get data
    sharing_setting = request.data.get('sharing_setting', deck.sharing_setting)
    scheduling_algorithm = request.data.get('scheduling_algorithm', deck.scheduling_algorithm)

    if sharing_setting not in ('PRIVATE', 'FRIENDS', 'PUBLIC'):
        return Response({'message': 'Invalid `sharing_setting`.  Must be `PRIVATE`, `FRIENDS`, or `PUBLIC`'}, status=400)
    if scheduling_algorithm not in ('ANKI', 'ANKING'):
        return Response({'message': 'Invalid `scheduling_algorithm`.  Must be `ANKI` or `ANKING`'}, status=400)

    # Edit the deck
    deck.title = request.data.get('new_title', deck.title)
    deck.description = request.data.get('description', deck.description)
    deck.sharing_setting = sharing_setting
    deck.scheduling_algorithm = scheduling_algorithm
    deck.shuffle_unseen_cards = request.data.get('shuffle_unseen_cards', deck.shuffle_unseen_cards)
    deck.daily_new_card_limit = request.data.get('daily_new_card_limit', deck.daily_new_card_limit)

    deck.save()
    return Response(DeckSerializer(instance=deck).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_copy_view(request, deck_id, *args, **kwargs):
    """
    Copy a deck to a user's own list of decks - POST

    Required information:
        `deck_id`: (URL): ID of the deck to copy
    
    Possible errors:
        Invalid deck ID: 404, Deck not found
        User attempts to copy a deck they don't have access to: 403, You cannot copy a private deck
        User not authenticated: 403
    """
    # Get deck
    try:
        deck = Deck.objects.get(pk=deck_id)
    except ObjectDoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)
    
    # Check if the user has permission to copy the deck
    if deck.sharing_setting == 'PRIVATE' or \
       (deck.sharing_setting == 'FRIENDS' and request.user not in deck.user.profile.friends.all()):
        return Response({'message': 'You cannot copy a private deck'}, status=403)
    
    # Copy deck
    deck.pk = None
    deck.user = request.user
    deck.sharing_setting = 'PRIVATE'
    deck.title = f'Copy of {deck.title}'
    deck.save()
    return Response(DeckSerializer(deck).data, status=200)


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
    except ObjectDoesNotExist:
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
    
    Possible errors:
        No action specified: 400, Please specify an action
        Invalid deck ID: 404, Deck not found
        Invalid flashcard ID: 404, Flashcard not found
        User attempts to suspend a deck they don't own: 403, You are not authorized to (un)suspend/leech this deck
        User not authenticated: 403
    """
    # Check action is specified
    if not request.data.get('action'):
        return Response({'message': 'Please specify an action'}, status=400)

    # Get flashcard
    try:
        flashcard = FlashCard.objects.get(pk=flashcard_id, deck__user=request.user)
    except ObjectDoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=404)

    # Set flashcard as (un)suspended/leeched
    action = request.data.get('action')
    if action in ('suspend', 'unsuspend'):
        flashcard.is_suspended = (action == 'suspend')
    elif action in ('leech', 'unleech'):
        flashcard.set_is_leech(action == 'leech', save=False)
    flashcard.save()

    return Response(FlashCardSerializer(flashcard).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcard_search_view(request, *args, **kwargs):
    """
    Searches for flashcards based on some parameters - GET

    Required information:
        `deckIds`: (GET) IDs (plural) of decks to search in. If None, searches in all the user's decks
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
    # Get list of decks to search in
    deck_qs = request.user.decks.all()
    deck_ids = request.GET.get('deckIds')
    if deck_ids:
        deck_ids = deck_ids.split(',')
        deck_qs = deck_qs.filter(pk__in=deck_ids)

    if not deck_qs.exists():
        return Response({}, status=200)
    
    # Get flashcards
    flashcard_qs = deck_qs.first().flashcards.all()
    for deck in deck_qs[1:]:
        flashcard_qs |= deck.flashcards.all()

    # Search flashcards
    # We will be ANDing (&=) a bunch more queries to this
    # and using it as a filter in the end.
    flashcard_query = Q()

    # Filter by tags
    tags = request.GET.get('tags')
    if tags:
        if isinstance(tags, str):
            tag_list = [tag.strip() for tag in tags.split(',')]
        else:
            tag_list = tags

        # Gets a list of flashcard IDs, if the
        # flashcard has a tag that is in `tag_list`
        flashcard_ids = [
            flashcard.id for flashcard in flashcard_qs if len( # each flashcard if...
                set(
                    [ # (set form of all tags in a card)
                        tag.strip() for tag in flashcard.tags.split(',')
                    ] # ...has any shared elements in `tag_list`
                ).intersection(set(tag_list))) > 0
        ] 
        flashcard_query &= Q(id__in=flashcard_ids)

    # Filter by contains
    contains = request.GET.get('contains')
    if contains:
        flashcard_query &= Q(front_text__icontains=contains) | Q(back_text__icontains=contains)

    # Filter by suspended, leech, and learning status
    suspended = request.GET.get('suspended')
    if suspended is not None:
        flashcard_query &= Q(is_suspended=suspended.lower() == 'true')
    
    leech = request.GET.get('leech')
    if leech is not None:
        if leech.lower() == 'true':
            filter_func = lambda flashcard: flashcard.is_leech()
        else:
            filter_func = lambda flashcard: not flashcard.is_leech()

        flashcard_ids = [flashcard.id for flashcard in flashcard_qs if filter_func(flashcard)]
        flashcard_query &= Q(id__in=flashcard_ids)
    
    learning_status = request.GET.get('learningStatus')
    if learning_status is not None:
        flashcard_query &= Q(learning_status__iexact=learning_status)

    # Filter by min/max ease
    min_ease = request.GET.get('minEase')
    if min_ease is not None:
        flashcard_query &= Q(ease__gte=int(min_ease))
    
    max_ease = request.GET.get('maxEase')
    if max_ease is not None:
        flashcard_query &= Q(ease__lte=int(max_ease))
    
    # Execute query
    flashcard_qs = flashcard_qs.filter(flashcard_query)

    # Return
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
        deck_qs = Deck.objects.filter(sharing_setting='PUBLIC')

        # Function for calculating how "relevant" each search result is
        THRESHOLD = 80
        sorting_function = lambda deck: -(
            +fuzz.token_set_ratio(query, deck.description)  *1.0
            +fuzz.token_set_ratio(query, deck.title)        *2.0
            +fuzz.token_set_ratio(query, deck.user.username)*0.8
            +(deck.thanks.count() + 1)                      *0.005
        )

        # Sort based on function
        sorted_qs = sorted([deck for deck in deck_qs if sorting_function(deck) < -THRESHOLD], key=sorting_function)

        # Cache result for 6 hours
        cache.set(CACHE_KEY, sorted_qs, 60*60*6)

    # return Response(DeckSerializer(sorted_qs, many=True).data, status=200)
    return get_paginated_queryset_response(sorted_qs, request, DeckSerializer, 5)


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
    convert_formatting = request.data.get('convert_formatting')

    # Convert formatting function
    if convert_formatting:
        regex = r"\[[^][]*]|(\$)" # this is used for selecting all $'s outside of [brackets]

        convert_formatting_func = lambda text: re.sub(regex, lambda m: '\\$' if m.group(1) else m.group(), text)\
            .replace('[$$]', '$$').replace('[/$$]', '$$').replace('[$]', '$').replace('[/$]', '$')
    else:
        convert_formatting_func = lambda text: text

    # Parse text document
    split_lines = uploaded_file.split('\n')
    front_and_back = [convert_formatting_func(line).split('\t') for line in split_lines if line]

    # Get/create deck with given title
    deck, created = Deck.objects.get_or_create(user=request.user, title=deck_title)

    # Create flashcards
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)
    flashcards = [
        FlashCard(
            deck=deck,
            front_text=front,
            back_text=back,
            next_review=this_morning,
        )
        for front, back in front_and_back
    ]
    FlashCard.objects.bulk_create(flashcards)

    # Return
    return Response(DeckSerializer(deck).data, status=201)
