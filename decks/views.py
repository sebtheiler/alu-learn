from django.shortcuts import render, redirect
from .models import Deck, SharedDeck
from django.http import Http404


# Renders information on a specific deck
def decks_detail_view(request, deck_id, *args, **kwargs):
    try:
        deck = SharedDeck.objects.get(pk=deck_id)
        if not deck.user_has_access(request.user):
            raise Http404('You are not authorized to view this deck')
    except SharedDeck.DoesNotExist:
        deck = None

    context = {
        'deck_id': deck_id,
        'deck_title': deck.title if deck else 'Deck',
        'current_username': request.user.username,
    }

    return render(request, 'decks/detail.html', context=context)


# Renders a list of flashcards in a deck (used in browsing)
def flashcard_list_view(request, deck_id, *args, **kwargs):
    try:
        is_foreign_user = not Deck.objects.get(pk=deck_id).user == request.user
    except Deck.DoesNotExist:
        return redirect('/home/')

    return render(request, 'flashcards/list.html', context={
        'deck_id': deck_id,
        'is_foreign_user': is_foreign_user,
    })
