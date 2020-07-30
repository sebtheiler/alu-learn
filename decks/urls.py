from django.urls import path
from . import views

app_names = 'decks'
urlpatterns = [
    path('decklist/', views.deck_list_view),
    path('create/', views.deck_create_view),
    path('<int:deck_id>/delete/', views.deck_delete_view),
    path('<int:deck_id>/', views.deck_detail_view),
]