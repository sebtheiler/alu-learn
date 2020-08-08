from django.urls import path

from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    path('decklist/', views.deck_list_view),
    path('create/', views.deck_create_view),
    path('<int:deck_id>/delete/', views.deck_delete_view),
    path('<int:deck_id>/', views.deck_detail_view),
    path('<int:deck_id>/flashcards/create/', views.flashcard_create_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/', views.flashcard_detail_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/delete/', views.flashcard_delete_view),
    path('feed/', views.deck_feed_view),
]
