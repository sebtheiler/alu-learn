from django.urls import path

from . import views

# Base endpoint = /api/sharing_system/
urlpatterns = [
    path('deck/<int:deck_id>/actions/', views.get_deck_actions),
    path('deck/<int:deck_id>/pull/', views.pull_deck_updates),
    path('deck/<int:deck_id>/share/', views.shared_deck_create_view),
    path('flashcard/list/', views.snapshot_flashcards_view),
    path('resolve/', views.resolve_conflict),
    path('shareddeck/<int:shared_deck_id>/', views.get_shared_deck),
    path('shareddeck/<int:shared_deck_id>/copy/', views.copy_shared_deck_view),
    path('shareddeck/<int:shared_deck_id>/edit/', views.edit_shared_deck),
    path('shareddeck/<int:shared_deck_id>/push/', views.shared_deck_push_view),
    path('shareddeck/<int:shared_deck_id>/submitted/', views.list_submitted_changes),
    path('snapshot/<uuid:snapshot_id>/shareddeck/', views.get_shared_deck_from_snapshot_id),
    path('submittedchanges/<uuid:submitted_changes_id>/', views.get_submitted_changes),
    path('submittedchanges/<uuid:submitted_changes_id>/decide/', views.decide_submitted_changes),
]
