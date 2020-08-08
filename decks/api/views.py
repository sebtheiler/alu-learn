from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.db.models import Q

from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..forms import DeckForm
from ..models import Deck, FlashCard, Tag
from ..serializers import DeckSerializer


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


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer):
    paginator = PageNumberPagination()
    paginator.page_size = 50
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
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_feed_view(request, *args, **kwargs):
    """
    Gets a feed/homepage list of decks for a logged-in user - GET

    Returns:
        A list of decks (DeckSerializer)
    """
    user = request.user
    feed_qs = Deck.objects.feed(user)
    return get_paginated_queryset_response(feed_qs, request, DeckSerializer)


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
    """
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({}, status=404)
    obj = decks_qs.first()
    serializer = DeckSerializer(decks_qs, many=True)
    return Response(serializer.data[0])


@api_view(['DELETE', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_delete_view(request, deck_id, *args, **kwargs):
    """
    Deletes a deck - DELETE/POST

    Required information:
        `deck_id`: (URL) The id of the deck to be deleted
    
    Returns:
        `message`: Deck deleted successfully
        `status`: 200
    
    Possible errors:
        Current user does not own deck: 401, {message: 'You are not authorized to delete this deck.'}
    """
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to delete this deck.'}, 401)
    obj = decks_qs.first()
    obj.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)
