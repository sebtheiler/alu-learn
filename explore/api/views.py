from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response

from decks.models import Deck
from decks.serializers import DeckSerializer
from django.db.models import Q
from django.views.decorators.cache import cache_page

EDITOR_PICKS_DECK_IDS = [20, 21, 18, 22]
TOP_DECK_IDS = [19, 24, 23, 25]
HOT_DECK_IDS = []

def get_decks_from_ids(id_list, public_only=False):
    query = Q(pk__in=id_list)
    if public_only:
        query &= Q(sharing_setting='PUBLIC')

    decks_qs = Deck.objects.filter(query)
    return DeckSerializer(decks_qs, many=True).data

@cache_page(60*15)
@api_view(['GET'])
def api_explore_lists_view(request, *args, **kwargs):
    """
    Get decks to display in explore list - GET
    """
    data = {
        'EDITOR': get_decks_from_ids(EDITOR_PICKS_DECK_IDS, public_only=True),
        'TOP': get_decks_from_ids(TOP_DECK_IDS, public_only=True),
        'HOT': get_decks_from_ids(HOT_DECK_IDS, public_only=True),
    }

    return Response(data, status=200)
