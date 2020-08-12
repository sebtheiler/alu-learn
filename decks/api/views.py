from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.utils import timezone
from django.db.models import Q

from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..forms import DeckForm
from ..models import Deck, FlashCard, Tag
from ..serializers import DeckSerializer, FlashCardSerializer


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_create_view(request, *args, **kwargs):
    """
    Create a deck - POST

    Required information:
        `title`: (Data) Title of the deck to create

    Returns:
        Author of the deck (PublicProfileSerializer): 'author'
        Title of the deck: 'title'
        ID of the deck: 'id'
    """
    serializer = DeckSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response({}, status=400)


@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def flashcard_create_view(request, deck_id, *args, **kwargs):
    """
    Create a flashcard to a deck - GET/POST

    Required information:
        `deck_id`: (URL) ID of the deck to create a flashcard in
        `front_text`: (Data) Text to go on the front of the flashcard
        `back_text`: (Data) Text to go on the back of the flashcard
    
    Possible errors:
        Deck ID does not exist: 400, {message: 'Unknown deck ID'}
        Front/back text is None: 400, {message: 'Front and back text must not be None'}
    """
    deck_qs = Deck.objects.filter(pk=deck_id)
    if deck_qs.exists():
        deck = deck_qs.first()
    else:
        return Response({'message': 'Unknown deck ID'}, 400)

    front_text = request.data.get('front_text')
    back_text = request.data.get('back_text')
    if front_text is not None and back_text is not None:
        created = FlashCard.objects.create(deck=deck, front_text=front_text, back_text=back_text, next_review=timezone.now())
        return Response(FlashCardSerializer(instance=created).data, 201)
    return Response({'message': 'Front and back text must not be None'}, 400)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `front_text`: (Data) What to set the front text to
        `back_text`: (Data) What to set the back text to

    Possible errors:
        Deck does not exist: 404, {message: 'Deck not found'}
        Current user does not own deck: 401, {message: 'You are not authorized to edit this flashcard'}
        Flashcard does not exist: 404, {message: 'Flashcard not found'}
    """
    # Get the deck
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to edit this flashcard'}, status=401)
    deck = decks_qs.first()

    # Get the flashcard
    flashcard_qs = deck.flashcards.filter(pk=flashcard_id)
    if not flashcard_qs.exists():
        return Response({'message': 'Flashcard not found'}, status=404)

    # Edit the flashcard
    obj = flashcard_qs.first()
    obj.front_text = request.data.get('front_text')
    obj.back_text = request.data.get('back_text')
    obj.save()
    return Response(FlashCardSerializer(instance=obj).data, 200)


@api_view(['POST'])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# TODO: rename and readd permissins
def flashcard_changedate_view(request, deck_id, flashcard_id, *args, **kwargs):
    """
    Edit a flashcard - POST

    Required information:
        `deck_id`: (URL) ID of the deck in which we are editing the flashcard
        `flashcard_id`: (URL) ID of the flashcard we are editing
        `date`: (Data) ISO string date for next review
        `graduated`: (Data) if the card is graduated
        `ease` Ease of card
        `interval`: next interval TODO make doc better

    Possible errors:
        Deck does not exist: 404, {message: 'Deck not found'}
        Current user does not own deck: 401, {message: 'You are not authorized to edit this flashcard'}
        Flashcard does not exist: 404, {message: 'Flashcard not found'}
    """
    # Get the deck
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    # decks_qs = decks_qs.filter(user=request.user)
    # if not decks_qs.exists():
    #     return Response({'message': 'You are not authorized to edit this flashcard'}, status=401)
    deck = decks_qs.first()

    # Get the flashcard
    flashcard_qs = deck.flashcards.filter(pk=flashcard_id)
    if not flashcard_qs.exists():
        return Response({'message': 'Flashcard not found'}, status=404)

    # Edit the flashcard
    obj = flashcard_qs.first()
    obj.next_review = request.data.get('date')
    obj.graduated = request.data.get('graduated')
    obj.ease = request.data.get('ease')
    obj.interval = request.data.get('interval')
    obj.save()
    return Response(FlashCardSerializer(instance=obj).data, 200)



@api_view(['DELETE', 'POST'])
@authentication_classes([SessionAuthentication])
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
        Deck does not exist: 404, {message: 'Deck not found'}
        Current user does not own deck: 401, {message: 'You are not authorized to delete this deck'}
        Flashcard does not exist: 404, {message: 'Flashcard not found'}
    """
    # Get the deck
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to delete this flashcard'}, status=401)
    deck = decks_qs.first()
    # Get the flashcard
    flashcard_qs = deck.flashcards.filter(pk=flashcard_id)
    if not flashcard_qs.exists():
        return Response({'message': 'Flashcard not found'}, status=404)
    # Delete the flashcard
    obj = flashcard_qs.first()
    obj.delete()
    return Response({'message': 'Flashcard deleted succesfully'}, status=200)


@api_view(['GET'])
def flashcard_detail_view(request, deck_id, flashcard_id, *args, **kwargs):
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
        Invalid deck: 404, {message: 'Deck not found'}
        Invalid flashcard: 404, {message: 'Flashcard not found'}
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


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer, page_size=50):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    user = request.user
    paginated_qs = paginator.paginate_queryset(qs, request)
    serializer = Serializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def deck_list_view(request, *args, **kwargs):
    """
    Get a list of all decks from a username - GET

    Required information:
        `username`: (Data) Username of the user to get decks from.  If None, returns all decks.
    
    Returns:
        A list of decks (DeckSerializer)
    """
    decks_qs = Deck.objects.all()
    username = request.GET.get('username')
    if username is not None:
        decks_qs = decks_qs.by_username(username)    
    return get_paginated_queryset_response(decks_qs, request, DeckSerializer)


@api_view(['GET'])
# TODO: maybe we don't need SessionAuthentication?
# @authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_feed_view(request, *args, **kwargs):
    """
    Gets a feed/homepage list of decks for a logged-in user - GET

    Returns:
        A list of decks (DeckSerializer)
    """
    user = request.user
    print(request.user)
    feed_qs = Deck.objects.feed(user)
    return get_paginated_queryset_response(feed_qs, request, DeckSerializer)


@api_view(['GET'])
# TODO: require permission/authentication
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
        Invalid deck: 404, {message: 'Deck not found'}
    """
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    obj = decks_qs.first()
    serializer = DeckSerializer(obj)
    return Response(serializer.data)


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
        Current user does not own deck: 401, {message: 'You are not authorized to delete this deck.'}
    """
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({'message': 'Deck not found'}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to delete this deck.'}, status=401)
    obj = decks_qs.first()
    obj.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)
