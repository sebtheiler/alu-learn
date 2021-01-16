import datetime as dt
import json
import random
import re
from copy import deepcopy
from itertools import chain
from typing import List, Tuple

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

from ..models import (CustomStudySessionManager, Deck, DeckClone,
                      DeckStudySessionManager, DeckThank, FlashCard,
                      FlashCardCreator, FlashCardField, SharedDeck,
                      SharedDeckRelation, StudySessionManager)
from ..serializers import (CustomStudySessionManagerSerializer, DeckSerializer,
                           DeckThankSerializer, FlashCardCreatorSerializer,
                           FlashCardSerializer, SharedDeckSerializer,
                           StudySessionManagerSerializer)
from .utils import get_paginated_queryset_response, weighted_sample


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
        `difficulty`: (Data) Difficulty of the deck to create, HARD, NORM, or EASY

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
        difficulty=request.data.get('difficulty', 'HARD'),
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

def create_flashcard_review_instance(flashcard_type, creator, field):
    """
    Function for creating flashcard review instances, given a flashcard type, creator, and text for cloze

    `flashcard_type`: Type of the flashcard to create (e.g., 'cloze', 'basic', 'reversed')
    `creator`: FlashCardCreator object that will house this flashcard review instance
    `field`: Only needed for cloze flashcards, provides the text to parse with regex to get cloze instances
    """
    # Get background information
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

    try:
        all_content_indicies = CONTENT_INDICIES_DICT[flashcard_type.upper()]
    except KeyError:
        raise ValueError(f'Flashcard type "{flashcard_type}" unrecognized')

    # Create flashcard review instance
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

        return [
            cloze_flashcard(match)
            for match in re.finditer(r"{{c\d*::.*?}}", json.dumps(field), re.MULTILINE) \
                if int(match.group().split("::")[0][3:]) not in cloze_ids
        ]
    else:
        # Create a flashcard for each field
        return [
            FlashCard(
                creator=creator,
                next_review=this_morning,
                content_indicies=all_content_indicies[i],
            )
            for i in range(len(all_content_indicies))
        ]


def get_max_flashcard_creator_num(deck):
    creators = FlashCardCreator.objects.filter(deck=deck)
    max_fc_num_obj = creators.order_by('-flashcard_num').first()
    return max_fc_num_obj.flashcard_num if max_fc_num_obj else 0


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
        creator = FlashCardCreator.objects.create(
            deck=deck,
            tags=tags,
            flashcard_type=flashcard_type,
            flashcard_num=get_max_flashcard_creator_num(deck) + 1,
        )

        FlashCardField.objects.bulk_create([
            FlashCardField(
                creator=creator,
                text=text,
                field_number=i,
            )
            for i, text in enumerate(fields)
        ])

        flashcards = create_flashcard_review_instance(flashcard_type, creator, fields[0])
        FlashCard.objects.bulk_create(flashcards)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deck_private_list(request, *args, **kwargs):
    """
    Gets a list of the current user's private decks - GET
    """
    return Response(DeckSerializer(Deck.objects.filter(user=request.user, deck_type='standard'), many=True).data, status=200)

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
        deck = SharedDeck.objects.get(pk=deck_id)
    except SharedDeck.DoesNotExist:
        try:
            deck = Deck.objects.get(pk=deck_id)
        except Deck.DoesNotExist:
            return Response({'message': 'Deck not found'}, status=404)

    # Make sure the user is authorized
    if not (
        request.user == deck.user or ( # Viewing own profile
            isinstance(deck, SharedDeck) and ( # Is a shared deck and...
                deck.sharing_setting == 'PUBLIC' or ( # The deck is public or...
                    deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all() # the user is a friend
                )
            )
        )
    ):
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
    if not (
        request.user == deck.user or ( # Viewing own profile
            isinstance(deck, SharedDeck) and ( # Is a shared deck and...
                deck.sharing_setting == 'PUBLIC' or ( # The deck is public or...
                    deck.sharing_setting == 'FRIENDS' and request.user in deck.user.profile.friends.all() # the user is a friend
                )
            )
        )
    ):
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
        `scheduling_algorithm`: (Data) Which scheduling algorithm to use, ANKI or ANKING
        `shufle_unseen_cards`: (Data) Whether or not to shuffle unseen cards
        `difficulty`: (Data) New difficulty of the deck, HARD, NORM, or EASY

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
    scheduling_algorithm = request.data.get('scheduling_algorithm', deck.study_session_manager.scheduling_algorithm)

    if scheduling_algorithm not in ('ANKI', 'ANKING'):
        return Response({'message': 'Invalid `scheduling_algorithm`.  Must be `ANKI` or `ANKING`'}, status=400)

    # Edit the deck
    deck.title = request.data.get('new_title', deck.title)
    deck.study_session_manager.scheduling_algorithm = scheduling_algorithm
    deck.study_session_manager.shuffle_unseen_cards = request.data.get('shuffle_unseen_cards', deck.study_session_manager.shuffle_unseen_cards)
    deck.study_session_manager.daily_new_card_limit = request.data.get('daily_new_card_limit', deck.study_session_manager.daily_new_card_limit)
    deck.study_session_manager.review_ahead_minutes = request.data.get('review_ahead_minutes')
    deck.study_session_manager.difficulty = request.data.get('difficulty', deck.study_session_manager.difficulty)

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


def search_flashcards(user, deck_ids=None, tags=None, contains=None, suspended=None, leech=None, learning_status=None, min_ease=None, max_ease=None, due_before=None, custom_query=None, return_query_only=False):
    # Search flashcards
    # We will be ANDing (&=) a bunch more queries to this
    # and using it as a filter in the end.
    flashcard_query = Q(creator__deck__user__pk=user.pk)

    # Filter by deck Id
    if deck_ids:
        flashcard_query &= Q(creator__deck__pk__in=deck_ids.split(','))

    # Filter by tags (and leech)
    # Note: using __icontains is not perfect, since it would have "car" appear in "carpet"
    if tags or leech is not None:
        tag_query = Q()
        if tags:
            # Split by the operators AND and OR
            separated_tags = [el.strip() for el in re.split('(AND)|(OR)', tags) if el is not None]

            i = 0
            while i < len(separated_tags):
                if separated_tags[i] in ('AND', 'OR'):
                    i += 1
                    continue

                previous_operator = separated_tags[i - 1] if i > 0 else None
                contains_query = Q(creator__tags__icontains=separated_tags[i])

                # Invert the query if it starts with NOT
                if separated_tags[i].startswith('NOT '):
                    contains_query = ~Q(creator__tags__icontains=separated_tags[i].replace('NOT ', ''))

                # Decide how to merge the query, based on the previous value being AND or OR
                if previous_operator == 'AND' or previous_operator is None:
                    tag_query &= contains_query
                elif previous_operator == 'OR':
                    tag_query |= contains_query
                else:
                    return Response({'message': 'Invalid tags query'}, status=400)
                
                i += 1

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
        flashcard_query &= Q(next_review__lt=due_before)

    # Allow a custom query for efficiency
    if custom_query:
        flashcard_query &= custom_query

    # Execute query
    print(flashcard_query)
    if return_query_only:
        return flashcard_query
    else:
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
    max_flashcard_num = get_max_flashcard_creator_num(deck)
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

    # TODO: investigate if this is needed, or if it is handled by tasks.py
    # If it is a new day since flashcards were previously done,
    # reset the counter for new/unseen flashcards
    if ssm.last_flashcard_date < timezone.now().date():
        ssm.new_cards_done_today = 0

    # Only flashcards today that are within the review_ahead_minutes cutoff
    # .combine is needed to convert the date object to a datetime object
    now = timezone.now()
    now = min(
        now + dt.timedelta(minutes=ssm.review_ahead_minutes),
        dt.datetime.combine(dt.date.today() + dt.timedelta(days=1), dt.datetime.min.time(), tzinfo=dt.timezone.utc)
    )

    if isinstance(ssm, DeckStudySessionManager):
        ssm_flashcards = FlashCard.objects.filter(creator__deck__pk=ssm.deck.pk)
        seen_flashcards = ssm_flashcards.filter(
            Q(next_review__lt=now) &
            ~Q(learning_status__iexact='UNSEEN') &
            Q(is_suspended=False)
        )
        unseen_flashcards = ssm_flashcards.filter(learning_status__iexact='UNSEEN', is_suspended=False)
    elif isinstance(ssm, CustomStudySessionManager):
        searched_flashcards = search_flashcards(
            request.user,
            ssm.deck_ids,
            ssm.tags,
            ssm.contains,
            False, # suspended (can't study suspended cards)
            ssm.leech,
            ssm.learning_status,
            ssm.min_ease,
            ssm.max_ease,
            now,
        )

        seen_flashcards = searched_flashcards.filter(~Q(learning_status__iexact='UNSEEN'))
        unseen_flashcards = searched_flashcards.filter(learning_status__iexact='UNSEEN')
    else:
        return Response({'message': 'Unrecognized SSM'}, status=400)

    if ssm.daily_new_card_limit - ssm.new_cards_done_today > 0:
        if ssm.shuffle_unseen_cards:
            unseen_flashcards = random.sample(
                list(unseen_flashcards),
                min(ssm.daily_new_card_limit - ssm.new_cards_done_today, unseen_flashcards.count()),
            )
        else:
            unseen_flashcards = unseen_flashcards[:ssm.daily_new_card_limit - ssm.new_cards_done_today]
    flashcards = list(chain(seen_flashcards, unseen_flashcards))

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
        `utc_timezone_offset`: (Data) (Optional) UTC timezone offset used to mark date for completing flashcard

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
    flashcard.creator.deck.user.profile.increment_cards_done_today(request.data.get('utc_timezone_offset'))
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
        title=request.data.get('title', f'New Custom Study - {random.randint(0, 1000)}'),
        deck_ids=str(request.data.get('deck_ids')).replace('[', '').replace(']', '').replace(' ', ''),
        tags=request.data.get('tags'),
        contains=request.data.get('contains'),
        leech=request.data.get('leech'),
        learning_status=request.data.get('learning_status'),
        min_ease=request.data.get('min_ease'),
        max_ease=request.data.get('max_ease'),
        last_flashcard_date=timezone.now(),
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
        if flashcard_creator.copied_from_creator:
            continue
 
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


def clone_flashcard_creator(creator_to_clone_from: FlashCardCreator, new_deck=None, set_was_updated=False, origin_or_copied='COPIED', skip_creating_review_instances=False) -> Tuple[FlashCardCreator, List[FlashCard]]:
    """
    Clones and saves a full copy of a flashcard creator
    (returns the creator's review instances)

    `creator_to_clone_from`: The FlashCardCreator object to clone from
    `new_deck`: The Deck object the new creator will be housed in
    `set_was_updated`: Mark the new FlashCardCreator as being updated (may be used to stop it from being deleted)
    `origin_or_creator`: Whether to update the origin_creator or copied_from_creator attribute. ORIGIN for shared decks; COPIED for pulling.
    `skip_creating_review_instances`: If True, skips creating review instances, for efficiency reasons (may be used when updating shared decks)
    """
    new_flashcard_creator = deepcopy(creator_to_clone_from)

    # Reset (some) attributes
    new_flashcard_creator.pk = None
    new_flashcard_creator.id = None
    new_flashcard_creator.shared_mirror = None # reset the one2one relation
    if origin_or_copied == 'COPIED':
        new_flashcard_creator.origin_creator = None
        new_flashcard_creator.copied_from_creator = creator_to_clone_from
    elif origin_or_copied == 'ORIGIN':
        new_flashcard_creator.origin_creator = creator_to_clone_from
        new_flashcard_creator.copied_from_creator = None
    else:
        raise ValueError('Invlaid value for `origin_or_copied`')

    if new_deck:
        # Change to now belonging to the new deck
        new_flashcard_creator.deck = new_deck
    if set_was_updated:
        new_flashcard_creator.was_updated = True
    new_flashcard_creator.save()

    # Clone the flashcard creator's fields
    new_creator_fields = deepcopy(creator_to_clone_from.fields.all())
    for field in new_creator_fields:
        field.pk = None
        field.creator = new_flashcard_creator
        field.save()

    # Derive the flashcards review instances from the creator
    if not skip_creating_review_instances:
        new_flashcards = create_flashcard_review_instance(
            new_flashcard_creator.flashcard_type,
            new_flashcard_creator,
            new_flashcard_creator.fields.first().text,           
        )
    else:
        new_flashcards = None

    return new_flashcard_creator, new_flashcards

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
        DeckStudySessionManager.objects.create(
            deck=deck,
            user=request.user.profile,
            scheduling_algorithm=request.data.get('scheduling_algorithm', 'ANKI'),
            shuffle_unseen_cards=request.data.get('shuffle_unseen_cards', False),
            daily_new_card_limit=request.data.get('daily_new_card_limit', 20),
            last_flashcard_date=timezone.now(),
        )

    # Add the deck into the destination decks list of shared decks
    SharedDeckRelation.objects.create(
        deck=deck,
        shared_deck=shared_deck,
        cloned_at_version=shared_deck.version_number,
    )

    DeckClone.objects.create(
        deck=shared_deck,
        profile=request.user.profile,
    )

    # Create flashcards for each creator in the cloned deck
    # This process is very inefficient and needs future optimizations
    shared_flashcard_creators = shared_deck.flashcards.all().prefetch_related('fields')
    flashcards = []
    for shared_flashcard_creator in shared_flashcard_creators:
        _, new_flashcards = clone_flashcard_creator(shared_flashcard_creator, deck)
        flashcards += new_flashcards
    FlashCard.objects.bulk_create(flashcards)

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
    diff = {'created': 0, 'modified': 0, 'deleted': 0}

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

    # Update the shared deck's flashcard creators
    origin_flashcard_creators = origin_deck.flashcards.prefetch_related('fields', 'shared_mirror')
    for origin_flashcard_creator in origin_flashcard_creators:
        try:
            shared_mirror = origin_flashcard_creator.shared_mirror
        except FlashCardCreator.DoesNotExist as e:
            shared_mirror = None

        if shared_mirror is None: 
            # Create new shared mirror
            if not check_diff_only:
                # (we don't create review instances in shared decks)
                clone_flashcard_creator(
                    origin_flashcard_creator,
                    shared_deck,
                    set_was_updated=True,
                    origin_or_copied='ORIGIN',
                    skip_creating_review_instances=True,
                )
            
            diff['created'] += 1
        else:
            # If the flashcard creator already has a corresponding shared mirror, update it
            _, actual_difference = update_flashcard_creator(
                creator_to_update=shared_mirror,
                creator_to_get_updates_from=origin_flashcard_creator,
                check_diff_only=check_diff_only,
            )
            if actual_difference:
                diff['modified'] += 1

    # Delete all flashcards that weren't updated
    shared_mirrors = FlashCardCreator.objects.filter(deck=shared_deck)
    not_updated = shared_mirrors.filter(was_updated=False)
    diff['deleted'] += not_updated.count()
    if not check_diff_only:
        not_updated.delete()
    shared_mirrors.update(was_updated=False)

    if check_diff_only:
        return Response(diff, status=200)
    else:
        shared_deck.version_number += 1
        shared_deck.save()
        return Response(SharedDeckSerializer(shared_deck).data, status=200)


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
    needs_updating = []
    for shared_deck_relation in deck.shared_deck_relations.all().prefetch_related('shared_deck'):
        if shared_deck_relation.cloned_at_version < shared_deck_relation.shared_deck.version_number:
            needs_updating.append({
                'title': shared_deck_relation.shared_deck.title,
                'id': shared_deck_relation.shared_deck.id,
            })

    return Response({'needs_updating': needs_updating}, status=200)


def update_flashcard_creator(creator_to_update: FlashCardCreator, creator_to_get_updates_from: FlashCardCreator, check_diff_only=False) -> Tuple[FlashCardCreator, bool]:
    # Keep track if there were any actual changes
    actual_difference = False

    # Update flashcard fields
    fields_to_update = creator_to_update.fields.all()
    fields_to_get_updates_from = creator_to_get_updates_from.fields.all()
    for field_with_updates in fields_to_get_updates_from:
        try:
            # Try to get the field to update that corresponds with the field to get updates from
            field_to_update = fields_to_update.get(field_number=field_with_updates.field_number)
        except FlashCardField.DoesNotExist:
            # If it doesn't exist, create it
            if not check_diff_only:
                FlashCardField.objects.create(
                    creator=creator_to_update,
                    text=field_with_updates.text,
                    field_number=field_with_updates.field_number,
                )
            actual_difference = True
            continue
 
        if field_to_update.text != field_with_updates.text:
            if not check_diff_only:
                field_to_update.text = field_with_updates.text
                field_to_update.save()
            actual_difference = True
    
    # Update tags, order, and mark as being updated
    if creator_to_update.tags != creator_to_get_updates_from.tags:
        if not check_diff_only:
            creator_to_update.tags = creator_to_get_updates_from.tags
        actual_difference = True
    if creator_to_update.flashcard_num != creator_to_get_updates_from.flashcard_num:
        if not check_diff_only:
            creator_to_update.flashcard_num = creator_to_get_updates_from.flashcard_num
        actual_difference = True
    
    creator_to_update.was_updated = True
    creator_to_update.save()

    return creator_to_update, actual_difference

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deck_pull_updates_view(request, deck_id, *args, **kwargs):
    """
    Gets the updates for a deck - POST

    Required information:
        `deck_id`: (URL) Id of the deck to updates
        `to_pull_from`: (Data) Id of the shared deck to pull changes from (can be a list)
    """
    # Get deck
    try:
        deck = Deck.objects.get(
            pk=deck_id,
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck does not exist / you are unauthorized'}, status=400)
    
    # Get shared deck(s)
    to_pull_from = request.data.get('to_pull_from')
    if isinstance(to_pull_from, int):
        try:
            shared_deck = SharedDeck.objects.get(pk=to_pull_from)
        except SharedDeck.DoesNotExist:
            return Response({'message': 'Deck does not exist / you are unauthorized'}, status=400)

        # Pulled deletions are not happening because when the shared flashcard creator is deleted,
        # the copied_from_creator is set to null, and it is then seen in the following line
        local_flashcard_creators = FlashCardCreator.objects.filter(deck=deck, copied_from_creator__deck=shared_deck)
        shared_flashcard_creators = shared_deck.flashcards.all().prefetch_related('fields')
        flashcards = []
        for shared_flashcard_creator in shared_flashcard_creators:
            try:
                local_flashcard_creator = local_flashcard_creators.get(copied_from_creator=shared_flashcard_creator)
            except FlashCardCreator.DoesNotExist:
                local_flashcard_creator = None
            
            if local_flashcard_creator is None:
                # Clone the new flashcard creator
                _, new_flashcards = clone_flashcard_creator(shared_flashcard_creator, deck, set_was_updated=True)
                flashcards += new_flashcards
            else:
                # Update existing flashcard creator
                update_flashcard_creator(
                    creator_to_update=local_flashcard_creator,
                    creator_to_get_updates_from=shared_flashcard_creator,
                )

        # Create all flashcard review instances
        FlashCard.objects.bulk_create(flashcards)

        # Delete all flashcards that weren't updated
        not_updated = local_flashcard_creators.filter(was_updated=False)
        not_updated.delete()
        local_flashcard_creators.update(was_updated=False)

        # Bump version number and return
        shared_deck_relation = deck.shared_deck_relations.get(shared_deck=shared_deck)
        shared_deck_relation.cloned_at_version = shared_deck.version_number
        shared_deck_relation.save()
        return Response(DeckSerializer(deck).data, status=200)
    else:
        # Pulling multiple decks at once is currently not implemented
        return Response({}, status=501)


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
        query &= search_flashcards(
            request.user,
            cssm.deck_ids,
            cssm.tags,
            cssm.contains,
            False, # suspended (can't study suspended cards)
            cssm.leech,
            None, # learning status is specified above
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
        query &= search_flashcards(
            user=request.user,
            tags=request.data.get('options').get('tag'),
            return_query_only=True,
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
def rearrange_flashcard_view(request, flashcard_id, *args, **kwargs):
    """
    Rearranges flashcards - POST

    Required information:
        `flashcard_id`: Id of the FlashCardCreator to rearrange
        `rearrange_type`: Way to rearrange the flashcard
            'UP': Decrease the flashcard's number
            'DOWN': Increase the flashcard's number
    """
    try:
        flashcard = FlashCardCreator.objects.get(deck__user=request.user, pk=flashcard_id)
    except FlashCardCreator.DoesNotExist:
        return Response({'message': 'Flashcard creator not found'}, status=404)

    deck = flashcard.deck
    if deck.deck_type != 'standard':
        return Response({'message': 'Can only rearrange flashcards on regular decks'}, status=400)
    rearrange_type = request.data.get('rearrange_type')

    if rearrange_type == 'UP':
        if flashcard.flashcard_num == 0:
            return Response({'message': 'Flashcard already at top'}, status=400)
        above_flashcard = deck.flashcards.get(flashcard_num=flashcard.flashcard_num - 1)
        above_flashcard.flashcard_num += 1
        flashcard.flashcard_num -= 1
        FlashCardCreator.objects.bulk_update([flashcard, above_flashcard], ['flashcard_num'])
    elif rearrange_type == 'DOWN':
        if flashcard.flashcard_num == get_max_flashcard_creator_num(deck):
            return Response({'message': 'Flashcard already at bottom'}, status=400)
        below_flashcard = deck.flashcards.get(flashcard_num=flashcard.flashcard_num + 1)
        below_flashcard.flashcard_num -= 1
        flashcard.flashcard_num += 1
        FlashCardCreator.objects.bulk_update([flashcard, below_flashcard], ['flashcard_num'])
    else:
        return Response({'message': 'Invalid `rearrange_type`'})

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
