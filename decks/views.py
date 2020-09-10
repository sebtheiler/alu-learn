from django.shortcuts import render, redirect
from django.views import generic
from django.core.exceptions import ObjectDoesNotExist
from .models import Deck


# Render the home-page view
def decks_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'decks/home.html', status=200)


# Renders information on a specific deck
def decks_detail_view(request, deck_id, *args, **kwargs):
    context = {
        'deck_id': deck_id,
        'current_username': request.user.username,
    }

    return render(request, 'decks/detail.html', context=context)


# Renders the flashcard create view
def flashcard_create_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')

    # Check that the user has permission to create flashcards
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except ObjectDoesNotExist:
        return redirect('/home/')

    context = {
        'deck_id': deck_id,
        'flashcard_id': None,
        'desc': f'Create a new flashcard in "{deck.title}"',
        'sub_desc': 'Use "Tab" to cycle through steps, and use enter to press create once it is selected',
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders the flashcard edit view
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')

    # Check that the user has permission to create flashcards
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except ObjectDoesNotExist:
        return redirect('/home/')

    context = {
        'deck_id': deck_id,
        'flashcard_id': flashcard_id,
        'return_to_previous_page': True,
        'desc': f'Edit your flashcard in "{deck.title}"',
        'sub_desc': 'After saving, you may need to reload the previous page to see new changes'
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders a list of flashcards in a deck (used in browsing)
def flashcard_list_view(request, deck_id, *args, **kwargs):
    # TODO: remove due date when foreign user, also reset all information when copying deck
    is_foreign_user = not Deck.objects.get(pk=deck_id).user == request.user
    return render(request, 'flashcards/list.html', context={'deck_id': deck_id, 'is_foreign_user': is_foreign_user})

# Renders the flashcard search tool
def flashcard_search_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'flashcards/search.html', context={'username': request.user.username})

# Renders when studying an individual deck
def deck_study_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'decks/study.html', context={'deck_id': deck_id})

# Renders the view for importing decks
def deck_import_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'decks/import.html')

# Studies flashcards based on a set of criteria
def custom_study_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    context = {
        'deck_ids': request.GET.get('deckIds'),
        'tags': request.GET.get('tags'),
        'contains': request.GET.get('contains'),
        'suspended': request.GET.get('suspended'),
        'leech': request.GET.get('leech'),
        'learning_status': request.GET.get('learning_status'),
        'min_ease': request.GET.get('minEase'),
        'max_ease': request.GET.get('maxEase'),
    }

    return render(request, 'decks/custom-study.html', context=context)