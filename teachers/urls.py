from django.urls import path
from utils.api_utils import render_basic_view

from . import views

urlpatterns = [
    path('classroom/<int:classroom_id>/', render_basic_view(
        'misc/home.html',
        context_kwargs=True,
    )),
    path(
        'classroom/<int:classroom_id>/study/<str:sub_section>/',
        views.classroom_assignment_study,
    ),
    path(
        'classroom/<int:classroom_id>/flashcards/sections/<str:sub_section>/',
        views.classroom_flashcards,
    ),
]
