from django.urls import path

from . import views

# Base endpoint = /api/decks/
urlpatterns = [
    path('deck/share/', views.shared_deck_create_view),
]
