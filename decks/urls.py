from django.urls import path
from utils import render_basic_view

urlpatterns = [
    path('decks/import/', render_basic_view('decks/import.html')),
    path('flashcards/search/', render_basic_view('flashcards/search.html')),
    path('deck/<int:deck_id>/', render_basic_view(
        'misc/home.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/study/', render_basic_view(
        'decks/study.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/study/<str:section>/', render_basic_view(
        'decks/study.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/create/<str:sub_section>/', render_basic_view(
        'flashcards/create.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/<uuid:flashcard_id>/edit/', render_basic_view(
        'flashcards/create.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path('deck/<int:deck_id>/flashcards/sections/<str:section>/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path('community/deck/', render_basic_view(
        'decks/detail.html',
        context_kwargs=True,
    )),
    path('community/deck/<int:shared_deck_id>/', render_basic_view(
        'decks/detail.html',
        context_kwargs=True,
    )),
    path('community/deck/<int:shared_deck_id>/snapshots/<uuid:snapshot_id>/', render_basic_view(
        'decks/detail.html',
        context_kwargs=True,
    )),
    path('community/deck/<int:shared_deck_id>/flashcards/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path(
        'community/deck/<int:shared_deck_id>/flashcards/sections/<str:section>/',
        render_basic_view(
            'flashcards/list.html',
            context_kwargs=True,
        ),
    ),
    path('community/deck/<int:shared_deck_id>/flashcards/<uuid:snapshot_id>/', render_basic_view(
        'flashcards/list.html',
        context_kwargs=True,
    )),
    path(
        'community/deck/<int:shared_deck_id>/flashcards/<uuid:snapshot_id>/sections/<str:section>/',
        render_basic_view(
            'flashcards/list.html',
            context_kwargs=True,
        ),
    ),
    path('deck/<int:deck_id>/share/', render_basic_view('decks/shared/share.html')),
    path('decks/<int:deck_id>/share/push/', render_basic_view('decks/shared/push.html')),
    path('decks/<int:deck_id>/get-updates/', render_basic_view('decks/shared/update.html')),
    path('decks/<int:deck_id>/game/', render_basic_view('decks/games.html')),
    path('decks/<int:deck_id>/stats/', render_basic_view('decks/stats.html')),
]
