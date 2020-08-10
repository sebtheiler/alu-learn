from django.shortcuts import render
from django.views import generic


# Render the home-page feed view
def decks_feed_view(request, *args, **kwargs):
    return render(request, 'pages/feed.html', status=200)


# Render a global list of decks (unused, should probably be removed)
def decks_list_view(request, *args, **kwargs):
    return render(request, 'decks/list.html')


# Renders information on a specific deck
def decks_detail_view(request, deck_id, *args, **kwargs):
    return render(request, 'decks/detail.html', context={'deck_id': deck_id})


# Renders the flashcard create view
def flashcard_create_view(request, deck_id, *args, **kwargs):
    context = {
        'deck_id': deck_id,
        'flashcard_id': None,
        'desc': 'Create a new flashcard',
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders the flashcard edit view
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
    context = {
        'deck_id': deck_id,
        'flashcard_id': flashcard_id,
        'redirect_url': f'/{deck_id}/flashcards/',
        'desc': 'Edit your flashcard',
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders a list of flashcards in a deck (used in browsing)
def flashcard_list_view(request, deck_id, *args, **kwargs):
    return render(request, 'flashcards/list.html', context={'deck_id': deck_id})