import datetime as dt
import random
import re
from copy import deepcopy
from itertools import chain
import json

from django.core.cache import cache
from django.db.models import Q
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

from ..models import (CustomStudySessionManager, Deck, DeckStudySessionManager,
                      DeckThank, FlashCard, FlashCardCreator, FlashCardField,
                      SharedDeck, StudySessionManager)
from ..serializers import (CustomStudySessionManagerSerializer, DeckSerializer,
                           DeckThankSerializer, FlashCardCreatorSerializer,
                           FlashCardSerializer, StudySessionManagerSerializer,
                           SharedDeckSerializer)
from .utils import get_paginated_queryset_response


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
        scheduling_algorithm=request.data.get('scheduling_algorithm', 'ANKI'),
        shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', False),
        daily_new_card_limit=request.data.get('daily_new_card_limit', 20),
        last_flashcard_date=timezone.now(),
    )

    return Response(DeckSerializer(new_deck).data, status=201)


CONTENT_INDICIES_DICT = {
    'BASIC': [
        # Front to back
        [0, 1],
    ],
    'REVERSED': [
        # Front to back and back to front
        [0, 1],
        [1, 0],
    ],
    'CLOZE': [
        # One sided
        [0],
    ],
}
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
    
    Possible errors:
        Deck ID does not exist or the user is unauthenticated: 400, Deck not found / unauthorized
        Content is None: 400, Content must not be None
    """
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found / unauthorized'}, status=400)

    fields = request.data.get('fields')
    flashcard_type = request.data.get('flashcard_type', 'basic')
    tags = request.data.get('tags')
    if fields is not None:
        now = timezone.now()
        this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

        creator = FlashCardCreator.objects.create(
            deck=deck,
            tags=tags,
            flashcard_type=flashcard_type,
        )

        FlashCardField.objects.bulk_create([
            FlashCardField(
                creator=creator,
                text=text,
                field_number=i,
            )
            for i, text in enumerate(fields)
        ])

        content_indicies = CONTENT_INDICIES_DICT.get('flashcard_type.upper()')
        if content_indicies is None:
            return Response({'message': 'Unrecognized flashcard type'}, status=400)

        if flashcard_type == 'cloze':
            # Create a flashcard for each cloze segment
            cloze_ids = []
            def cloze_flashcard(match):
                cloze_id = int(match.group().split(":")[0][3:])
                cloze_ids.append(cloze_id)
                return FlashCard(
                    creator=creator,
                    next_review=this_morning,
                    content_indicies=[0],
                    name=f'cloze-{cloze_id}'
                )

            flashcards = FlashCard.objects.bulk_create([
                cloze_flashcard(match)
                for match in re.finditer(r"{{c\d*::.*?}}", json.dumps(fields[0]), re.MULTILINE) \
                    if int(match.group().split("::")[0][3:]) not in cloze_ids
            ])
        else:
            # Create a flashcard for each field
            flashcards = FlashCard.objects.bulk_create([
                FlashCard(
                    creator=creator,
                    next_review=this_morning,
                    content_indicies=all_content_indicies[i],
                )
                for i in range(len(all_content_indicies))
            ])

        return Response(FlashCardSerializer(instance=flashcards, many=True).data, 201)
    else:
        return Response({'message': 'Content must not be None'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
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
        flashcard = FlashCardCreator.objects.get(pk=flashcard_id, deck__user=request.user)
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
                for match in re.finditer(r"{{c\d*::.*?}}", json.dumps(new_fields[0]), re.MULTILINE):
                    cloze_id = int(match.group().split("::")[0][3:])
                    try:
                        # If the flashcard already exists, mark it as not needing deletion
                        fc = flashcards.get(name=f'cloze-{cloze_id}')
                        try:
                            flashcards_to_delete.remove(fc.id) # the flashcard is still used, so we shouldn't delete it
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
            _ = (f.text for f in fields) # for some reason, this line is needed
            for i, text in enumerate(new_fields):
                fields[i].text = text
            FlashCardField.objects.bulk_update(fields, ['text'])
        else:
            return Response({'message': 'Incorrect number of fields specified'}, status=400)

    flashcard.save()
    return Response(FlashCardCreatorSerializer(instance=flashcard).data, 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flashcard_delete_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Deletes a flashcard - POST

    Required information:
        `deck_id`: (URL) The ID of the deck in which the flashcard is located
        `flashcard_id`: (URL) The ID of the flashcard creator to delete
    
    Returns:
        `message`: Flashcard deleted successfully
        `status`: 200
    
    Possible errors:
        Flashcard does not exist or user does not own it: 400, Flashcard not found / you are unauthorized
    """
    # Get the flashcard
    try:
        flashcard = FlashCardCreator.objects.get(pk=flashcard_id, deck__user=request.user)
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=400)

    # Delete the flashcard
    flashcard.delete()
    return Response({'message': 'Flashcard deleted succesfully'}, status=200)


@api_view(['GET'])
def flashcard_detail_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Get specific information about a flashcard - GET

    Required information:
        `deck_id`: (URL) The ID of the deck (unused)
        `flashcard_id`: (URL) The ID of the flashcard creator

    Returns:
        Front text of the flashcard: 'front_text'
        Back text of the flashcard: 'back_text'
        ID of the flashcard: 'id'
    
    Possible errors:
        Invalid flashcard or user is unauthorized: 404, Flashcard not found / you are unauthorized
    """
    try:
        flashcard = FlashCardCreator.objects.get(pk=flashcard_id, deck__user=request.user)
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard not found / you are unauthorized'}, status=404)

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
        decks_qs = SharedDeck.objects.filter(Q(user=profile.user) & (Q(sharing_setting='PUBLIC') | Q(sharing_setting='FRIENDS')))
    else:
        decks_qs = SharedDeck.objects.filter(user=profile.user, sharing_setting='PUBLIC')

    return Response(SharedDeckSerializer(decks_qs, many=True).data, status=200)


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
    home_decks = Deck.objects.filter(
        user__username=request.user.username,
        deck_type='standard',
    ).order_by('title')
    home_cssms = CustomStudySessionManager.objects.filter(user=request.user.profile)
    home_list = list(chain(home_decks, home_cssms))

    return get_paginated_queryset_response(home_list, request, {
        Deck: DeckSerializer, CustomStudySessionManager: CustomStudySessionManagerSerializer
    }, page_size=50)


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
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not (request.user == deck.user or deck.sharing_setting == 'PUBLIC' or (deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all())):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    # Return
    serializer = DeckSerializer(deck, context={'request': request})
    return Response(serializer.data, status=200)


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
    if not (request.user == shared_deck.user or shared_deck.sharing_setting == 'PUBLIC' or (shared_deck.sharing_setting == 'FRIENDS' and request.user in shared_deck.user.profile.friends.all())):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    return Response(SharedDeckSerializer(shared_deck, context={'request': request}).data, status=200)


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
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not (request.user == deck.user or deck.sharing_setting == 'PUBLIC' or (deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all())):
        return Response({'message': 'You are unauthorized to view this deck'}, status=403)

    limit = request.GET.get('limit')
    if limit:
        # Return set number of flashcards (not paginated)
        serializer = FlashCardCreatorSerializer(deck.flashcards.all()[:int(limit)], context={'request': request}, many=True)
        return Response({
            'results': serializer.data,
            'count': deck.flashcards.count(),
        })
    else:
        # Return paginated list of all flashcards
        return get_paginated_queryset_response(
            deck.flashcards.order_by('pk'),
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
    
    Returns:
        `message`: Deck deleted successfully
        `status`: 200
    
    Possible errors:
        Current user does not own deck or deck ID is invalid: 400, Deck not found / you are unauthorized
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
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found / you are unauthorized'}, status=400)

    # Get data
    sharing_setting = request.data.get('sharing_setting', deck.sharing_setting)
    scheduling_algorithm = request.data.get('scheduling_algorithm', deck.study_session_manager.scheduling_algorithm)

    if sharing_setting not in ('PRIVATE', 'FRIENDS', 'PUBLIC'):
        return Response({'message': 'Invalid `sharing_setting`.  Must be `PRIVATE`, `FRIENDS`, or `PUBLIC`'}, status=400)
    if scheduling_algorithm not in ('ANKI', 'ANKING'):
        return Response({'message': 'Invalid `scheduling_algorithm`.  Must be `ANKI` or `ANKING`'}, status=400)

    # Edit the deck
    deck.title = request.data.get('new_title', deck.title)
    deck.description = request.data.get('description', deck.description)
    deck.sharing_setting = sharing_setting
    deck.study_session_manager.scheduling_algorithm = scheduling_algorithm
    deck.study_session_manager.shuffle_unseen_cards = request.data.get('shuffle_unseen_cards', deck.study_session_manager.shuffle_unseen_cards)
    deck.study_session_manager.daily_new_card_limit = request.data.get('daily_new_card_limit', deck.study_session_manager.daily_new_card_limit)
    deck.study_session_manager.review_ahead_minutes = request.data.get('review_ahead_minutes')

    deck.save()
    deck.study_session_manager.save()
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
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)
    print(deck.flashcards.all())

    # Check if the user has permission to copy the deck
    if deck.sharing_setting == 'PRIVATE' or (\
       deck.sharing_setting == 'FRIENDS' and request.user not in deck.user.profile.friends.all()):
        return Response({'message': 'You cannot copy a private deck'}, status=403)

    # Copy deck
    # This ALL needs to be redone when the git-like algorithm is implemented
    # deck.flashcards.update(
    #     id=None,
    #     tags='', # this also makes it not a leech
    #     learning_status='UNSEEN',
    #     ease=250,
    #     next_review=timezone.now(),
    #     interval=0,
    #     is_suspended=False,
    #     leech_index=0,
    # )
    deck.pk = None; deck.id = None
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


def search_flashcards(user, deck_ids=None, tags=None, contains=None, suspended=None, leech=None, learning_status=None, min_ease=None, max_ease=None, due_before=None):
    # Search flashcards
    # We will be ANDing (&=) a bunch more queries to this
    # and using it as a filter in the end.
    flashcard_query = Q(creator__deck__user__pk=user.pk)

    # Filter by deck Id
    if deck_ids:
        flashcard_query &= Q(creator__deck__pk__in=deck_ids.split(','))

    # Filter by tags (and leech)
    if tags or leech is not None:
        tag_query = Q()
        if tags:
            if isinstance(tags, str):
                tag_list = [tag.strip() for tag in tags.split(',')]
            else:
                tag_list = tags

            for tag in tag_list:
                tag_query |= Q(creator__tags__icontains=tag)

        # Also filter by leech, since it's a tag
        if str(leech).lower() == 'true':
            tag_query |= Q(creator__tags__icontains='leech')
        elif str(leech).lower() == 'false':
            tag_query |= ~Q(creator__tags__icontains='leech')

        flashcard_query &= tag_query

    # Filter by contains
    if contains:
        flashcard_query &= Q(creator__fields__text__icontains=contains)

    # Filter by suspended and learning status
    if suspended is not None:
        flashcard_query &= Q(is_suspended=suspended.lower() == 'true' if isinstance(suspended, str) else suspended)

    if learning_status is not None:
        flashcard_query &= Q(learning_status__iexact=learning_status)

    # Filter by min/max ease
    if min_ease is not None:
        flashcard_query &= Q(ease__gte=int(min_ease))

    if max_ease is not None:
        flashcard_query &= Q(ease__lte=int(max_ease))
    
    # Filter by due date
    if due_before:
        flashcard_query &= Q(next_review__lte=due_before)

    # Execute query
    return FlashCard.objects.filter(flashcard_query).prefetch_related('creator')

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
    flashcard_qs = search_flashcards(
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
    if created:
        DeckStudySessionManager.objects.create(deck=deck, user=request.user.profile, last_flashcard_date=timezone.now())

    # Create flashcards
    creators = FlashCardCreator.objects.bulk_create([
        FlashCardCreator(
            deck=deck,
            flashcard_type='basic',
        )
        for _ in front_and_back
    ])
    FlashCardField.objects.bulk_create([
        FlashCardField(
            creator=creator,
            text=front_and_back[i][num],
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

    # Return
    return Response(DeckSerializer(deck).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ssm_flashcards_view(request, ssm_id, *args, **kwargs):
    """
    Gets the due flashcards from a SSM 

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

    # If it is a new day since flashcards were previously done,
    # reset the counter for new/unseen flashcards
    if ssm.last_flashcard_date < timezone.now().date():
        ssm.new_cards_done_today = 0

    if isinstance(ssm, DeckStudySessionManager):
        now = timezone.now()
        now += dt.timedelta(minutes=ssm.review_ahead_minutes)

        ssm_flashcards = FlashCard.objects.filter(creator__deck__pk=ssm.deck.pk)
        seen_flashcards = ssm_flashcards.filter(
            Q(next_review__lte=now) &
            ~Q(learning_status__iexact='UNSEEN') &
            Q(is_suspended=False)
        )
        unseen_flashcards = ssm_flashcards.filter(learning_status__iexact='UNSEEN', is_suspended=False)

        if unseen_flashcards.count() > ssm.daily_new_card_limit:
            if ssm.shuffle_unseen_cards:
                unseen_flashcards = random.sample(
                    list(unseen_flashcards),
                    ssm.daily_new_card_limit - ssm.new_cards_done_today,
                )
            else:
                unseen_flashcards = unseen_flashcards \
                    [:ssm.daily_new_card_limit - ssm.new_cards_done_today]

        flashcards = list(chain(seen_flashcards, unseen_flashcards))
    elif isinstance(ssm, CustomStudySessionManager):
        flashcards = search_flashcards(
            request.user,
            ssm.deck_ids,
            ssm.tags,
            ssm.contains,
            False, # suspended (can't study suspended cards)
            ssm.leech,
            ssm.learning_status,
            ssm.min_ease,
            ssm.max_ease,
            timezone.now() + dt.timedelta(minutes=ssm.review_ahead_minutes),
        )
    else:
        return Response({'message': 'Unrecognized SSM'}, status=400)

    ssm.last_flashcard_date = timezone.now().date()
    ssm.save()

    return Response(FlashCardSerializer(flashcards, many=True).data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ssm_detail_view(request, ssm_id, *args, **kwargs):
    """
    Gets flashcards due for a study session manager - GET
    Required information:
        `ssm_id`: (URL) ID of the study session manager
    
    Possible errors:
        SSM does not exist: 404, SSM does not exist
    """
    try:
        ssm = StudySessionManager.objects.get(pk=ssm_id)
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
        `date`: (Data) ISO string date for next review
        `learning_status`: (Data) Learning status of the card, either 'UNSEEN', 'LEARNING', 'LEARNED', or 'RELEARNING'
        `ease`: (Data) Ease of card
        `interval`: (Data) The new interval for the flashcard
        `increment_new_cards_done_today`: (Data) Whether or not to increment the SSM's `new_cards_done_today` attribute

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
    flashcard.creator.deck.user.profile.increment_cards_done_today()
    if request.data.get('increment_new_cards_done_today'):
        ssm.new_cards_done_today += 1
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
            return Response({'message': f'SSM #{ssm_id} does not exist for {request.user.username}'}, status=404)

    try:
        # For CSSMs
        ssm.title = request.data.get('title', ssm.title)
        ssm.deck_ids = request.data.get('deck_ids', ssm.deck_ids)
        ssm.tags = request.data.get('tags', ssm.tags)
        ssm.contains = request.data.get('contains', ssm.contains)
        ssm.leech = request.data.get('leech', ssm.leech)
        ssm.learning_status = request.data.get('learning_status', ssm.learning_status)
        ssm.min_ease = request.data.get('min_ease', ssm.min_ease)
        ssm.max_ease = request.data.get('max_ease', ssm.max_ease)
    except AttributeError as e:
        return Response({'message': f'This SSM does not support that feature, "{e}"'}, status=400)

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
        return Response({'message': 'SSM does not exist / you are unauthorized, 400: SSM does not exist / you are unauthorized'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ssm_create_view(request, *args, **kwargs):
    """
    Creates a (custom) study session manager - POST
    """
    ssm = CustomStudySessionManager.objects.create(
        user=request.user.profile,
        title=f'New Custom Study - {random.randint(0, 1000)}',
        deck_ids=request.data.get('deck_ids'),
        tags=request.data.get('tags'),
        contains=request.data.get('contains'),
        leech=request.data.get('leech'),
        learning_status=request.data.get('learning_status'),
        min_ease=request.data.get('min_ease'),
        max_ease=request.data.get('max_ease'),
        last_flashcard_date=timezone.now(),
    )

    return Response(CustomStudySessionManagerSerializer(ssm).data, status=201)


# {"origin_deck_id": 3, "title": "a new copy of cloze", "description": "...", "sharing_setting": "PUBLIC"}
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
        )
    except Deck.DoesNotExist:
        return Response({'message': 'This deck does not exist / you are unauthorized'}, status=400)

    # Create shared deck object
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'Title must not be None'}, status=400)

    shared_deck = SharedDeck.objects.create(
        user=request.user,
        title=title,
        description=request.data.get('description'),
        sharing_setting=request.data.get('sharing_setting', 'PUBLIC'),
        deck_type='shared',
    )

    shared_deck.creators.set([origin_deck])

    # Clone flashcard creators and fields
    # This is very inefficient, but as it will seldomly be called,
    # I'm alright with that for now
    flashcard_creators = deepcopy(origin_deck.flashcards.prefetch_related('fields'))
    for flashcard_creator in flashcard_creators:
        # Clone flashcard creator
        shared_flashcard_creator = deepcopy(flashcard_creator)
        shared_flashcard_creator.pk = None
        shared_flashcard_creator.deck = shared_deck
        # Create a link between the origin flashcard creator and the shared flashcard creator
        shared_flashcard_creator.origin_creator = flashcard_creator

        shared_flashcard_creator.save()

        # Clone flashcard creator fields
        creator_fields = flashcard_creator.fields.all()
        for field in creator_fields:
            field.pk = None
            field.creator = shared_flashcard_creator
            field.save()

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
    # Get the shared deck
    try:
        shared_deck = SharedDeck.objects.get(pk=shared_deck_id)
        if shared_deck.sharing_setting == 'FRIENDS' and request.user not in shared_deck.user.friends:
            return Response({'message': 'You are unauthorized to clone this deck'}, status=403)
    except SharedDeck.DoesNotExist:
        return Response({'message': 'Shared deck not found'}, status=404)

    # Get or create the deck that the shared deck will be cloned into
    deck, created = Deck.objects.get_or_create(
        user=request.user,
        title=request.data.get('destination_deck_title'),
    )

    if created:
        # Create deck SSM
        ssm = DeckStudySessionManager.objects.create(
            deck=deck,
            user=request.user.profile,
            scheduling_algorithm=request.data.get('scheduling_algorithm', 'ANKI'),
            shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', False),
            daily_new_card_limit=request.data.get('daily_new_card_limit', 20),
            last_flashcard_date=timezone.now(),
        )

    # Add the deck into the destination decks list of shared decks
    deck.inherits_flashcards_from.add(shared_deck)
    deck.save()

    # Create flashcards for each creator in the cloned deck
    # This process is very inefficient and needs future optimizations
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)
    flashcards = []
    for flashcard_creator in shared_deck.flashcards.all().prefetch_related('fields'):
        # Clone the flashcard creator
        flashcard_creator.pk = None
        flashcard_creator.deck = deck
        flashcard_creator.save()

        # Clone the flashcard creator's fields
        creator_fields = flashcard_creator.fields.all()
        for field in creator_fields:
            field.pk = None
            field.creator = flashcard_creator
            field.save()

        # Clone the flashcards review instances from the creator
        if flashcard_creator.flashcard_type == 'cloze':
            # Create a flashcard for each cloze segment
            cloze_ids = []
            def cloze_flashcard(match):
                cloze_id = int(match.group().split(":")[0][3:])
                cloze_ids.append(cloze_id)
                return FlashCard(
                    creator=flashcard_creator,
                    next_review=this_morning,
                    content_indicies=[0],
                    name=f'cloze-{cloze_id}'
                )

            flashcards += [
                cloze_flashcard(match)
                for match in re.finditer(r"{{c\d*::.*?}}", json.dumps(flashcard_creator.fields.first().text), re.MULTILINE) \
                    if int(match.group().split("::")[0][3:]) not in cloze_ids
            ]
        else:
            # Create a flashcard for each field
            try:
                all_content_indicies = CONTENT_INDICIES_DICT[flashcard_creator.flashcard_type.upper()]
            except KeyError:
                return Response({'message': f'Flashcard type "{flashcard_creator.flashcard_type}" unrecognized'}, status=400)

            flashcards += [
                FlashCard(
                    creator=flashcard_creator,
                    next_review=this_morning,
                    content_indicies=all_content_indicies[i],
                )
                for i in range(len(all_content_indicies))
            ]
    FlashCard.objects.bulk_create(flashcards)


    return Response(DeckSerializer(Deck).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shared_deck_update_view(request, *args, **kwargs):
    """
    Allows the author of a shared deck to update it - POST

    Required information:
        `shared_deck_id`: (Data) Id of the shared deck
        `origin_deck_id`: (Data) Id of the deck to get new changes from
    """
    # Get shared deck
    try:
        shared_deck = SharedDeck.objects.get(pk=request.data.get('shared_deck_id'))
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

    # Update the shared deck's flashcard creators
    origin_flashcard_creators = origin_deck.flashcards.prefetch_related('fields', 'shared_mirror')
    shared_mirrors = FlashCardCreator.objects.filter(origin_creator__in=origin_flashcard_creators)
    print(shared_mirrors)
    for origin_flashcard_creator in origin_flashcard_creators:
        try:
            origin_flashcard_creator.shared_mirror
            has_mirror = True
        except FlashCardCreator.DoesNotExist as e:
            print(e)
            has_mirror = False

        if has_mirror: 
            shared_mirror = origin_flashcard_creator.shared_mirror
            print('mirror already exists, attempting to edit')
            # If the flashcard creator already has a corresponding shared mirror, update it
            for origin_field, shared_field in zip(origin_flashcard_creator.fields.all(), shared_mirror.fields.all()):
                if shared_field.text != origin_field.text:
                    print('mirror updated')
                    shared_field.text = origin_field.text
                    shared_field.save()
                    shared_mirror.was_updated = True
                    shared_mirror.save()
        else:
            print('creating new mirror')
            # Clone flashcard creator
            shared_flashcard_creator = deepcopy(origin_flashcard_creator)
            shared_flashcard_creator.pk = None
            shared_flashcard_creator.deck = shared_deck
            shared_flashcard_creator.was_updated = True
            shared_flashcard_creator.save()

            shared_flashcard_creator.origin_creator = origin_flashcard_creator
            shared_flashcard_creator.save()
            origin_flashcard_creator.save()

            print(shared_flashcard_creator.origin_creator.id)
            print(origin_flashcard_creator.shared_mirror.id)

            # Clone flashcard creator fields
            creator_fields = origin_flashcard_creator.fields.all()
            for field in creator_fields:
                field.pk = None
                field.creator = origin_flashcard_creator
                field.save()

    # Delete all flashcards that weren't updated
    not_updated = shared_mirrors.filter(was_updated=False)
    print('flashcard creators not updated:', not_updated)
    not_updated.delete()
    print(not_updated)
    shared_mirrors.update(was_updated=False)

    return Response(SharedDeckSerializer(shared_deck).data, status=201)


"""
Create
    * Select deck to upload
    * Select public / friends
    --
    * Shared Deck Obj is created (keeps track of shared flashcards and the edit history)
    * Flashcard creators and fields are cloned to shared flashcard object

Clone
    * Select deck to clone
    * Select whether to make a new deck or clone into existing
    --
    * Adds the shared deck into the list of decks to inherit from
    * Creates flashcards (not creators) for each new flashcard, each with a special link to the shared deck and shared flashcard it inherits from

Study
    * Study normally
    --
    * Each flashcard gets its informtion from its creator, regardless of whether that creator is a shared creator or not
    * If using an old version, undo all updates and deletes after that version (shared flashcards have a deleted in version tag)

Update
    User side:
        * See new changes for each shared deck (new cards, deleted cards)
        * Choice to update
    Editor side:
        * Option to push changes
        * When pushing, see diff
    --
    Calculating diff:
        * Each non-shared flashcard creator keeps track of which shared flashcard creator it updates
        * New flashcards are marked as having no corresponding creator
        * Modified flashcards are marked as having no corresponding creator
        * When pushing changes, shared flashcards that have no correspondance are marked as deleted
        * Flashcards that have no associated shared are created

Updating:
    * Specefic flashcards are created or deleted
"""
