from sharing_system.models import FlashCardAction
from django.urls import path
from utils import generate_base_api

from ..serializers import DeckSerializer, FlashCardSerializer
from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    # path('search/', views.deck_search_view),
    # ====== Decks ======
    *generate_base_api(
        'decks', 'deck',
        DeckSerializer,
        {'title': str},
        'user', 'USER',
        prefetch_list=('user', 'skill_tree_sections__children'),
    ),
    # ===== Deck Lists =====
    path('deck/list/quick/', views.deck_quick_list_view),
    path('deck/<int:deck_id>/flashcards/', views.deck_flashcards_view),
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
        'subsection__parent__deck__user', 'USER',
        exclude_create=True,
        exclude_list=True,
        exclude_edit=True,
        uuid_id=True,
        ActionModel=FlashCardAction,
    ),
    # ===== Flashcard Operations =====
    path('flashcard/create/', views.flashcard_create_view),
    path('flashcard/list/', views.flashcard_list_view),
    path('flashcard/<uuid:flashcard_id>/edit/', views.flashcard_edit_view),
    path('flashcard/<uuid:flashcard_id>/rearrange/', views.flashcard_rearrange_view),
    path('flashcard/search/', views.flashcard_search_view),
    # ==== Flashcard Bulk Update ====
    path('flashcard/edit-tags/', views.flashcard_edit_tags_bulk_view),
    path('flashcard/edit-review-instances/', views.flashcard_review_instance_bulk_update_view),
    # ===== Flashcard Study =====
    path('reviewinstance/study/', views.review_instance_study_view),
    path('reviewinstance/study/<uuid:review_instance_id>/', views.review_instance_update_view),
    path('games/flashcards/', views.game_flashcards_view),
]
