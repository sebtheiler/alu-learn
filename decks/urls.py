from django.urls import path
from . import views

app_names = 'decks'
urlpatterns = [
    path('decks/', views.deck_list_view),
    path('decks/<int:deck_id>/delete/', views.deck_delete_view),
    path('decks/<int:deck_id>/', views.deck_detail_view),
]