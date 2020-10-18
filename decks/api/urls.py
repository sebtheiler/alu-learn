from django.urls import path

from . import views

# Base endpoint = /api/decks/
app_names = 'decks'
urlpatterns = [
    path('create/', views.deck_create_view),
    path('search/', views.deck_search_view),
    path('textupload/', views.txt_file_upload),
    path('detail/<str:username>/', views.deck_shared_view),
    path('<int:deck_id>/', views.deck_detail_view),
    path('<int:deck_id>/delete/', views.deck_delete_view),
    path('<int:deck_id>/edit/', views.deck_edit_view),
    path('<int:deck_id>/copy/', views.deck_copy_view),
    path('<int:deck_id>/thank/', views.deck_thank_view),
    path('<int:deck_id>/flashcards/', views.deck_flashcards_view),
    path('<int:deck_id>/flashcards/create/', views.flashcard_create_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/', views.flashcard_detail_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/edit/', views.flashcard_edit_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/delete/', views.flashcard_delete_view),
    path('<int:deck_id>/flashcards/<int:flashcard_id>/suspend_or_leech/', views.flashcard_suspend_leech_view),
    path('ssm/create/', views.ssm_create_view),
    path('ssm/<int:ssm_id>/', views.ssm_detail_view),
    path('ssm/<int:ssm_id>/edit/', views.ssm_edit_view),
    path('ssm/<int:ssm_id>/delete/', views.ssm_delete_view),
    path('ssm/<int:ssm_id>/flashcards/', views.ssm_flashcards_view),
    path('ssm/<int:ssm_id>/flashcards/<int:flashcard_id>/update/', views.ssm_flashcard_update_view),
    path('flashcards/search/', views.flashcard_search_view),
    path('home/', views.deck_home_view),
    path('shared/create/', views.shared_deck_create_view),
]
