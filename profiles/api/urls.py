from django.urls import path

from .views import (
    profile_detail_api_view,
)

# Base endpoint = /api/profiles/
app_names = 'decks'
urlpatterns = [
    path('<str:username>/detail/', profile_detail_api_view),
    path('<str:username>/friend/', profile_detail_api_view),
]
