from django.urls import path
from utils import render_basic_view
from .views import *

urlpatterns = [
    path('home/notes/', render_basic_view('notes/home.html')),
    path('notes/edit/<int:note_id>/', notes_redirect_view(viewing=False)),
    path('notes/view/<int:note_id>/', notes_redirect_view(viewing=True)),
    path('notes/edit/<int:note_id>/page/<int:page_number>/', notes_view(viewing=False)),
    path('notes/view/<int:note_id>/page/<int:page_number>/', notes_view(viewing=True)),
    path('notes/create-flashcards/<int:note_id>/page/<int:page_number>/', render_basic_view('notes/flashcard-creator.html')),
]
