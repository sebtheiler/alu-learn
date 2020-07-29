from django.shortcuts import render
from django.views import generic
from django.http import JsonResponse, Http404, HttpResponse

from .models import Deck, FlashCard, Tag

# Create your views here.
class IndexView(generic.ListView):
    template_name = 'home/index.html'
    context_object_name = 'top_decks'

    def get_queryset(self):
        return ['Deck 1', 'Deck 2', 'Deck 3']


def deck_list_view(request, *args, **kwargs):
    decks = Deck.objects.all()
    deck_list = [{'id': d.id, 'title': d.title} for d in decks]
    data = {
        'response': deck_list,
    }
    return JsonResponse(data)


def deck_detail_view(request, deck_id, *args, **kwargs):
    data = {
        "id": deck_id,
    }

    status = 200
    try:
        obj = Deck.objects.get(pk=deck_id)
        data['title'] = obj.title
    except:
        data['message'] = 'Deck not found'
        status = 404
    # return HttpResponse(f'Deck: {obj.title} - #{deck_id}')
    return JsonResponse(data, status=404)