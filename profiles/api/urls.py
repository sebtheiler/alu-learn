from django.urls import path

from .views import (
    user_friend_view,
)

# Base endpoint = /api/profiles/
app_names = 'decks'
urlpatterns = [
    path('<str:username>/follow/', user_friend_view),
]
