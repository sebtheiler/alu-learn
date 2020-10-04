from django.urls import path
from .views import *

urlpatterns = [
    path('home/notes/', notes_home_view),
    path('notes/edit/<int:note_id>/', notes_editor_view),
    path('notes/study/<int:note_id>/', notes_viewer_view),
    path('notes/create-flashcards/<int:note_id>/', notes_create_flashcard_view),
]