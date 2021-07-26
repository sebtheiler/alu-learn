from decks.serializers import DeckSerializer
from utils import generate_base_api
from django.urls import path

from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    path('create/', views.deck_create_view),
    path('search/', views.deck_search_view),
    path('textupload/', views.txt_file_upload),
    path('upload/json/', views.deck_json_import_view),
    path('<int:deck_id>/export/json/', views.deck_json_export_view),
    path('list/', views.deck_private_list),
    path('quick/', views.deck_quick_list_view),
    path('detail/<str:username>/', views.deck_shared_view),
    path('<int:deck_id>/', views.deck_detail_view),
    path('<int:deck_id>/delete/', views.deck_delete_view),
    *generate_base_api(
        'decks', 'deck',
        DeckSerializer,
        {'title': str},
        'user', 'USER',
        exclude_app_name=True,
    ),
    path('<int:deck_id>/flashcards/', views.deck_flashcards_view),
    path('<int:deck_id>/gen-skill-tree/', views.deck_generate_skill_tree_view),
    path('<int:deck_id>/flashcards/create/', views.flashcard_create_view),
    path('<int:deck_id>/flashcards/<int:flashcard_num>/', views.flashcard_detail_view),
    path('<int:deck_id>/flashcards/<int:flashcard_num>/edit/', views.flashcard_edit_view),
    path('<int:deck_id>/flashcards/<int:flashcard_num>/delete/', views.flashcard_delete_view),
    path('<int:deck_id>/flashcards/<uuid:flashcard_id>/suspend_or_leech/', views.flashcard_suspend_leech_view),
    path('<int:deck_id>/flashcards/<int:flashcard_num>/rearrange/', views.rearrange_flashcard_view),
    path('<int:deck_id>/statistics/', views.deck_statistics_view),
    path('ssm/create/', views.ssm_create_view),
    path('ssm/<int:ssm_id>/', views.ssm_detail_view),
    path('ssm/<int:ssm_id>/edit/', views.ssm_edit_view),
    path('ssm/<int:ssm_id>/delete/', views.ssm_delete_view),
    path('ssm/<int:ssm_id>/flashcards/', views.ssm_flashcards_view),
    path('ssm/<int:ssm_id>/flashcards/<uuid:flashcard_id>/update/', views.ssm_flashcard_update_view),
    path('flashcards/search/', views.flashcard_search_view),
    path('get-updates/<int:deck_id>/', views.deck_get_updates_view),
    path('pull-updates/<int:deck_id>/', views.deck_pull_updates_view),
    path('edit-tags/', views.edit_tags_bulk_view),
    path('edit-review-instances/', views.flashcard_review_instance_bulk_update_view),
    path('shared/detail/<int:shared_deck_id>/', views.shared_deck_detail_view),
    path('shared/create/', views.shared_deck_create_view),
    path('shared/clone/<int:shared_deck_id>/', views.shared_deck_clone_view),
    path('shared/update/', views.shared_deck_update_view),
    path('shared/edit/<int:shared_deck_id>/', views.shared_deck_edit_view),
    path('games/flashcards/', views.game_flashcards_view),
]
