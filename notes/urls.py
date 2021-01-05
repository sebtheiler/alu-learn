from django.urls import path
from .views import *

urlpatterns = [
    path('home/notes/', notes_home_view),
    path('notes/edit/<int:note_id>/', notes_redirect_view(viewing=False)),
    path('notes/view/<int:note_id>/', notes_redirect_view(viewing=True)),
    path('notes/edit/<int:note_id>/page/<int:page_number>/', notes_view(viewing=False)),
    path('notes/view/<int:note_id>/page/<int:page_number>/', notes_view(viewing=True)),
    path('notes/create-flashcards/<int:note_id>/page/<int:page_number>/', notes_create_flashcard_view),
]