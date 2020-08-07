from django.urls import path

from .views import (
    user_friend_view,
    profile_detail_api_view,
)

# Base endpoint = /api/profiles/
app_names = 'decks'
urlpatterns = [
    path('<str:username>/detail/', profile_detail_api_view),
    path('<str:username>/friend/', user_friend_view),
]
