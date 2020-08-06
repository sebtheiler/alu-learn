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
    serializer = DeckSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response({}, status=400)


def get_paginated_queryset_response(qs, request, Serializer):
    paginator = PageNumberPagination()
    paginator.page_size = 50
    user = request.user
    paginated_qs = paginator.paginate_queryset(qs, request)
    serializer = Serializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
def deck_list_view(request, *args, **kwargs):
    decks_qs = Deck.objects.all()
    username = request.GET.get('username')
    if username is not None: # theoretically shows every deck to anon user
        decks_qs = decks_qs.by_username(username)    
    return get_paginated_queryset_response(decks_qs, request, DeckSerializer)


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_feed_view(request, *args, **kwargs):
    user = request.user
    feed_qs = Deck.objects.feed(user)
    return get_paginated_queryset_response(feed_qs, request, DeckSerializer)


@api_view(['GET'])
def deck_detail_view(request, deck_id, *args, **kwargs):
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
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to delete this deck.'}, 401)
    obj = decks_qs.first()
    obj.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)
