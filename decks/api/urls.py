from django.urls import path
from utils import generate_base_api

from ..serializers import DeckSerializer, FlashCardSerializer, ReviewInstanceSerializer
from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    path('search/', views.deck_search_view),
    # ====== Decks ======
    *generate_base_api(
        'decks', 'deck',
        DeckSerializer,
        {'title': str},
        'user', 'USER',
        exclude_app_name=True,
    ),
    # ===== Deck Lists =====
    path('deck/list/user/<str:username>/', views.deck_shared_list),
    path('deck/list/quick/', views.deck_quick_list_view),
    path('deck/<int:deck_id>/flashcards/', views.deck_flashcards_view),
    # ===== Shared Decks =====
    path('deck/shared/create/', views.shared_deck_create_view),
    path('deck/shared/<int:shared_deck_id>/detail/', views.shared_deck_detail_view),
    path('deck/shared/<int:shared_deck_id>/push-updates/', views.shared_deck_push_updates_view),
    path('deck/shared/<int:shared_deck_id>/clone/', views.shared_deck_clone_view),
    path('deck/<int:deck_id>/get-updates/', views.deck_get_updates_view),
    path('deck/<int:deck_id>/pull-updates/', views.deck_pull_updates_view),
    # ===== Deck Import/Export =====
    path('deck/import/txt/', views.deck_txt_import_view),
    path('deck/import/json/', views.deck_json_import_view),
    path('deck/<int:deck_id>/export/json/', views.deck_json_export_view),
    # ===== Other Deck Functions =====
    path('deck/<int:deck_id>/gen-skill-tree/', views.deck_generate_skill_tree_view),
    path('deck/<int:deck_id>/statistics/', views.deck_statistics_view),
    # ====== Flashcards =====
    *generate_base_api(
        'decks', 'flashcard',
        FlashCardSerializer,
        {'fields': list, 'tags': str},
        'deck__user', 'USER',
        exclude_app_name=True,
        exclude_create=True,
        exclude_edit=True,
    ),
    *generate_base_api(
        'decks', 'reviewinstance',
        ReviewInstanceSerializer,
        {
            'learning_status': str,
            'steps_index': int,
            'ease': int,
            'next_review': str,  # ISO-date
            'last_review': str,  # ISO-date
            'is_suspended': bool,
            'leech_index': int,
        },
        'flashcard__deck__user', 'USER',
        exclude_app_name=True,
        exclude_create=True,
        exclude_get=True,
        exclude_list=True,
        exclude_delete=True,
    ),
    # ===== Flashcard Operations =====
    path('flashcard/create/', views.flashcard_create_view),
    path('flashcard/<int:flashcard_id>/edit/', views.flashcard_edit_view),
    path('flashcard/<int:flashcard_id>/rearrange/', views.flashcard_rearrange_view),
    path('flashcard/search/', views.flashcard_search_view),
    # ==== Flashcard Bulk Update ====
    path('flashcard/edit-tags/', views.flashcard_edit_tags_bulk_view),
    path('flashcard/edit-review-instances/', views.flashcard_review_instance_bulk_update_view),
    # ===== Flashcard Study =====
    path('reviewinstance/study/', views.review_instance_study_view),
    path('reviewinstance/study/<uuid:review_instance_id>/', views.review_instance_update_view),
    path('ssm/<int:ssm_id>/flashcards/', views.ssm_flashcards_view),
    path('games/flashcards/', views.game_flashcards_view),
]
