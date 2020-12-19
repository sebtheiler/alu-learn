from django.urls import path

from .views import *

urlpatterns = [
    path('home/decks/', decks_home_view),
    path('decks/import/', deck_import_view),
    path('customstudy/<int:ssm_id>/study/', custom_study_view),
    path('flashcards/search/', flashcard_search_view),
    path('decks/<int:deck_id>/', decks_detail_view),
    path('decks/<int:deck_id>/study/', deck_study_view),
    path('decks/<int:deck_id>/flashcards/', flashcard_list_view),
    path('decks/<int:deck_id>/flashcards/create/', flashcard_create_view),
    path('decks/<int:deck_id>/flashcards/<int:flashcard_id>/edit/', flashcard_edit_view),
    path('decks/<int:deck_id>/share/', deck_share_view),
    path('decks/<int:deck_id>/share/push/', deck_push_view),
    path('decks/<int:deck_id>/get-updates/', deck_update_view),
    path('decks/<int:deck_id>/game/', deck_game_view),
]