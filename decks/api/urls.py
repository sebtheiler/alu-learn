from django.urls import path
from utils import generate_base_api

from ..serializers import DeckSerializer, FlashCardSerializer, ReviewInstanceSerializer
from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    path('search/', views.deck_search_view),
    path('textupload/', views.txt_file_upload),
    path('upload/json/', views.deck_json_import_view),
    path('<int:deck_id>/export/json/', views.deck_json_export_view),
    # Decks
    *generate_base_api(
        'decks', 'deck',
        DeckSerializer,
        {'title': str},
        'user', 'USER',
        exclude_app_name=True,
    ),
    path('deck/list/user/<str:username>/', views.deck_shared_list),
    path('deck/list/quick/', views.deck_quick_list_view),
    # Flashcards
    *generate_base_api(
        'decks', 'flashcard',
        FlashCardSerializer,
        {'fields': list, 'tags': str},
        'deck__user', 'USER',
        exclude_app_name=True,
        exclude_create=True,  # TODO: rewrite to use save signals
        exclude_edit=True,
    ),
    path('flashcard/create/', views.flashcard_create_view),
    path('flashcard/<int:flashcard_num>/edit/', views.flashcard_edit_view),
    # Review instances
    *generate_base_api(
        'decks', 'reviewinstance',
        ReviewInstanceSerializer,
        {
            'learning_status': str,
            'steps_index': int,
            'ease': int,
            'next_review': str,  # ISO-date
            'interval': int,
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
    path('<int:deck_id>/flashcards/', views.deck_flashcards_view),
    path('<int:deck_id>/gen-skill-tree/', views.deck_generate_skill_tree_view),
    path('<int:deck_id>/flashcards/<int:flashcard_num>/rearrange/', views.rearrange_flashcard_view),
    path('<int:deck_id>/statistics/', views.deck_statistics_view),
    path('ssm/<int:ssm_id>/flashcards/', views.ssm_flashcards_view),
    path('flashcards/search/', views.flashcard_search_view),
    path('get-updates/<int:deck_id>/', views.deck_get_updates_view),
    path('pull-updates/<int:deck_id>/', views.deck_pull_updates_view),
    path('edit-tags/', views.edit_tags_bulk_view),
    path('edit-review-instances/', views.flashcard_review_instance_bulk_update_view),
    path('shared/detail/<int:shared_deck_id>/', views.shared_deck_detail_view),
    path('shared/create/', views.shared_deck_create_view),
    path('shared/clone/<int:shared_deck_id>/', views.shared_deck_clone_view),
    path('shared/update/', views.shared_deck_update_view),
    path('games/flashcards/', views.game_flashcards_view),
]
