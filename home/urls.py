from django.urls import path
from . import views

app_names = 'home'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('createdeck', views.deck_create_view),
    path('decks', views.deck_list_view),
    path('api/decks/<int:deck_id>/delete', views.deck_delete_view),
    path('api/decks/<int:deck_id>', views.deck_detail_view),
]