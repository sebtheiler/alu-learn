from django.urls import path

from . import views

# Base endpoint = /api/explore/
app_names = 'explore'
urlpatterns = [
    path('lists/', views.api_explore_lists_view),
]
