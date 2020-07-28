from django.shortcuts import render
from django.views import generic

# Create your views here.
class IndexView(generic.ListView):
    template_name = 'home/index.html'
    context_object_name = 'top_decks'
    # context_object_name = 'latest_questions'

    def get_queryset(self):
        return ['Deck 1', 'Deck 2', 'Deck 3']