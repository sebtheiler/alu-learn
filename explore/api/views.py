from rest_framework.decorators import api_view
from rest_framework.response import Response

from decks.models import SharedDeck
from decks.serializers import SharedDeckSerializer
from django.db.models import Q
from django.views.decorators.cache import cache_page
import json

with open('editor_deck_ids.json', 'r') as f:
    EDITOR_PICKS_DECK_IDS = json.loads(f.read())

with open('top_deck_ids.json', 'r') as f:
    TOP_DECK_IDS = json.loads(f.read())

def get_decks_from_ids(id_list, public_only=False):
    query = Q(pk__in=id_list)
    if public_only:
        query &= Q(deck_type='shared')

    decks_qs = SharedDeck.objects.filter(query)
    return SharedDeckSerializer(decks_qs, many=True).data

@cache_page(60*15)
@api_view(['GET'])
def api_explore_lists_view(request, *args, **kwargs):
    """
    Get decks to display in explore list - GET
    """
    data = {
        'EDITOR': get_decks_from_ids(EDITOR_PICKS_DECK_IDS, public_only=True),
        'TOP': get_decks_from_ids(TOP_DECK_IDS, public_only=True),
        'HOT': [], #get_decks_from_ids(HOT_DECK_IDS, public_only=True),
    }

    return Response(data, status=200)
