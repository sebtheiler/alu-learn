from sharing_system.models import FlashCardAction
from django.urls import path
from utils import generate_base_api

from ..serializers import DeckSerializer, FlashCardSerializer
from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    # ====== Decks ======
    *generate_base_api(
        'decks', 'deck',
        DeckSerializer,
        {'title': str},
        'user', 'USER',
        prefetch_list=('user', 'main_sections__sub_sections'),
        exclude_list=True,
    ),
    # ===== Deck Lists =====
    path('deck/list/', views.deck_list),
    # ===== Deck Import/Export =====
    path('deck/import/txt/', views.deck_txt_import_view),
    path('deck/import/json/', views.deck_json_import_view),
    path('deck/<int:deck_id>/export/json/', views.deck_json_export_view),
    # ===== Other Deck Functions =====
    path('deck/<int:deck_id>/statistics/', views.deck_statistics_view),
    path('deck/<int:deck_id>/archive/', views.archive_deck),
    # ====== Flashcards =====
    *generate_base_api(
        'decks', 'flashcard',
        FlashCardSerializer,
        {'fields': list, 'tags': str},
        'sub_section__main_section__deck__user', 'USER',
        ActionModel=FlashCardAction,
        exclude_create=True,
        exclude_edit=True,
        exclude_list=True,
        exclude_rearrange=False,
        parent_model='sub_section',
        uuid_id=True,
    ),
    # ===== Flashcard Operations =====
    path('flashcard/create/', views.flashcard_create_view),
    path('flashcard/list/', views.flashcard_list_view),
    path(
        'flashcard/find-universal/<uuid:universal_flashcard_id>/',
        views.find_universal_flashcard,
    ),
    path('flashcard/<uuid:flashcard_id>/edit/', views.flashcard_edit_view),
    path('flashcard/search/', views.flashcard_search_view),
    # ===== Review Instances =====
    path('reviewinstance/study/', views.review_instance_study_view),
    path('reviewinstance/study/<uuid:review_instance_id>/', views.review_instance_update_view),
    path('reviewinstance/search/', views.review_instance_search_view),
    path('games/flashcards/', views.game_flashcards_view),
]
