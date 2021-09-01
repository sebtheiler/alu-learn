from django.urls import path

from . import views

# Base endpoint = /api/decks/
urlpatterns = [
    path('deck/share/', views.shared_deck_create_view),
    path('deck/<int:deck_id>/actions/', views.get_deck_actions),
    path('shareddeck/<int:shared_deck_id>/', views.get_shared_deck),
    path('shareddeck/<int:shared_deck_id>/edit/', views.edit_shared_deck),
    path('shareddeck/<int:shared_deck_id>/copy/', views.copy_shared_deck_view),
    path('shareddeck/<int:shared_deck_id>/push/', views.shared_deck_push_view),
    path('snapshot/<uuid:snapshot_id>/shareddeck/', views.get_shared_deck_from_snapshot_id),
    path('flashcard/list/', views.snapshot_flashcards_view),
]
