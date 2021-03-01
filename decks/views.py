from django.shortcuts import render, redirect
from .models import Deck, SharedDeck
from django.http import Http404
from utils import permissions


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


# Renders the flashcard create view
@permissions()
def flashcard_create_view(request, deck_id, *args, **kwargs):
    # Check that the user has permission to create flashcards
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return redirect('/home/')

    context = {
        'deck_id': deck_id,
        'flashcard_id': None,
        'desc': f'Create a new flashcard in "{deck.title}"',
        'sub_desc': 'Use "Tab" to cycle through steps, and use enter to press create once it is selected',
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders the flashcard edit view
@permissions()
def flashcard_edit_view(request, deck_id, flashcard_num, *args, **kwargs):
    # Check that the user has permission to create flashcards
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        return redirect('/home/')

    context = {
        'deck_id': deck_id,
        'flashcard_num': flashcard_num,
        'return_to_previous_page': True,
        'desc': f'Edit your flashcard in "{deck.title}"',
        'sub_desc': 'After saving, you may need to reload the previous page to see new changes'
    }
    return render(request, 'flashcards/create.html', context=context)


# Renders a list of flashcards in a deck (used in browsing)
def flashcard_list_view(request, deck_id, *args, **kwargs):
    try:
        is_foreign_user = not Deck.objects.get(pk=deck_id).user == request.user
    except Deck.DoesNotExist:
        return redirect('/home/')

    return render(request, 'flashcards/list.html', context={'deck_id': deck_id, 'is_foreign_user': is_foreign_user})


# Renders when studying an individual deck
@permissions()
def deck_study_view(request, deck_id, *args, **kwargs):
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
        raise Http404()

    return render(request, 'decks/study.html', context={'ssm_id': deck.study_session_manager.id, 'deck_title': deck.title})
