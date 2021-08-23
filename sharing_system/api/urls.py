from sharing_system.serializers import SharedDeckSerializer
from utils.api_gen import generate_base_api
from django.urls import path

from . import views

# Base endpoint = /api/decks/
urlpatterns = [
    *generate_base_api(
        'sharing_system', 'shareddeck',
        SharedDeckSerializer,
        {
            'title': str,
            'description': str,
            'view_access': str,
            'edit_access': str,
            'owners': str,
        },
        None, None,
        exclude_create=True,
        exclude_delete=True,
    ),
    path('deck/share/', views.shared_deck_create_view),
    path('flashcard/list/', views.snapshot_flashcards_view),
]
