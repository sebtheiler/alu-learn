from django.urls import path
from utils import render_basic_view
from .views import *

urlpatterns = [
    path('home/decks/', render_basic_view('decks/home.html')),
    path('decks/import/', render_basic_view('decks/import.html')),
    path('customstudy/<int:ssm_id>/study/', render_basic_view('decks/study.html')),
    path('flashcards/search/', render_basic_view('flashcards/search.html')),
    path('deck/<int:deck_id>/', render_basic_view('misc/home.html', context_kwargs=True)),
    path('deck/<int:deck_id>/study/', render_basic_view(
        'decks/study.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/study/', render_basic_view(
        'decks/study.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/study/<str:tags>/', render_basic_view(
        'decks/study.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/create/', render_basic_view(
        'flashcards/create.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/tags/<str:tags>/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path('decks/<int:deck_id>/share/', render_basic_view('decks/shared/share.html')),
    path('decks/<int:deck_id>/share/push/', render_basic_view('decks/shared/push.html')),
    path('decks/<int:deck_id>/get-updates/', render_basic_view('decks/shared/update.html')),
    path('decks/<int:deck_id>/game/', render_basic_view('decks/games.html')),
    path('decks/<int:deck_id>/stats/', render_basic_view('decks/stats.html')),
]
