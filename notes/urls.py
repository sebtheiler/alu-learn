from django.urls import path
from .views import *

urlpatterns = [
    path('home/notes/', notes_home_view),
    path('notes/edit/<int:note_id>/', notes_editor_view),
]