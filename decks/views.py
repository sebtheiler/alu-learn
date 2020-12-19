from django.shortcuts import render, redirect
from .models import Deck, SharedDeck
from django.http import Http404


# Render the home-page view
def decks_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'decks/home.html', status=200)


# Renders information on a specific deck
def decks_detail_view(request, deck_id, *args, **kwargs):
    try:
        deck = SharedDeck.objects.get(pk=deck_id)
        if deck.sharing_setting == 'FRIENDS' and request.user not in deck.user.profile.friends:
            raise Http404("You are not authorized to view this deck")
        shared_deck = True
    except SharedDeck.DoesNotExist:
        shared_deck = False

    context = {
        'deck_id': deck_id,
        'deck_title': deck.title if shared_deck else 'Deck',
        'current_username': request.user.username,
    }

    return render(request, 'decks/detail.html', context=context)


# Renders the flashcard create view
def flashcard_create_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

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
def flashcard_edit_view(request, deck_id, flashcard_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    # Check that the user has permission to create flashcards
    try:
        deck = Deck.objects.get(pk=deck_id, user=request.user)
    except Deck.DoesNotExist:
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
    try:
        is_foreign_user = not Deck.objects.get(pk=deck_id).user == request.user
    except Deck.DoesNotExist:
        return redirect('/home/')

    return render(request, 'flashcards/list.html', context={'deck_id': deck_id, 'is_foreign_user': is_foreign_user})

# Renders the flashcard search tool
def flashcard_search_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'flashcards/search.html', context={'username': request.user.username})

# Renders when studying an individual deck
def deck_study_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    try:
        deck = Deck.objects.get(pk=deck_id)
    except Deck.DoesNotExist:
        raise Http404()

    return render(request, 'decks/study.html', context={'ssm_id': deck.study_session_manager.id, 'deck_title': deck.title})

# Renders the view for importing decks
def deck_import_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'decks/import.html')

# Studies flashcards based on a set of criteria
def custom_study_view(request, ssm_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return render(request, 'decks/study.html', context={'ssm_id': ssm_id})

# Form for making a shared deck
def deck_share_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    
    return render(request, 'decks/shared/share.html', context={'deck_id': deck_id})

# Form for pushing updates to a shared deck
def deck_push_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    
    return render(request, 'decks/shared/push.html', context={'deck_id': deck_id})

# View for checking whether the shared decks that compose a deck need updating
def deck_update_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    
    return render(request, 'decks/shared/update.html', context={'deck_id': deck_id})

# View for playing games with decks
def deck_game_view(request, deck_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return render(request, 'decks/games.html', context={'deck_id': deck_id})
