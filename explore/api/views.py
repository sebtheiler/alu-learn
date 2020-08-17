from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response

from decks.models import Deck
from decks.serializers import DeckSerializer

EDITOR_PICKS_DECK_IDS = [1, 2, 5, 7, 8]
TOP_DECK_IDS = [] # TODO: calculate this daily
HOT_DECK_IDS = [] # TODO: calculate this daily

def get_decks_from_ids(id_list, public_only=False):
    decks_qs = Deck.objects.filter(pk__in=id_list)
    if public_only:
        decks_qs = decks_qs.filter(sharing_setting='PUBLIC')
    return DeckSerializer(decks_qs, many=True).data

@api_view(['GET'])
def api_explore_lists_view(request, *args, **kwargs):
    data = {
        'EDITOR': get_decks_from_ids(EDITOR_PICKS_DECK_IDS, public_only=True),
        'TOP': get_decks_from_ids(TOP_DECK_IDS, public_only=True),
        'HOT': get_decks_from_ids(HOT_DECK_IDS, public_only=True),
    }

    return Response(data, status=200)
