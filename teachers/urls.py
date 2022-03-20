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
        views.classroom_study_sub_section,
    ),
    path(
        'classroom/<int:classroom_id>/study/assignment/<int:assignment_id>/',
        render_basic_view('decks/study.html', context_kwargs=True)
    ),
    path(
        'classroom/<int:classroom_id>/flashcards/sections/<str:sub_section>/',
        views.classroom_flashcards,
    ),
]
