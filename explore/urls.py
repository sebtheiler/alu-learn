from django.urls import path

from .views import (
    explore_home_view,
    deck_search_view,
)

urlpatterns = [
    path('', explore_home_view),
    path('decks/search/', deck_search_view),
]