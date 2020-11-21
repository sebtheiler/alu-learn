from django.urls import path

from .views import (
    note_create_api_view,
    note_detail_api_view,
    note_page_update_api_view,
    note_delete_api_view,
    user_notes_api_view,
    note_page_create_api_view,
    note_page_detail_api_view,
    note_update_api_view,
    note_page_delete_api_view,
)

# Base endpoint = /api/notes/
urlpatterns = [
    path('list/', user_notes_api_view),
    path('create/', note_create_api_view),
    path('create-page/', note_page_create_api_view),
    path('detail/<int:note_id>/', note_detail_api_view),
    path('page-detail/<int:note_id>/<int:page_number>/', note_page_detail_api_view),
    path('update/<int:note_id>/', note_update_api_view),
    path('page-update/<int:note_id>/<int:page_id>/', note_page_update_api_view),
    path('delete/<int:note_id>/', note_delete_api_view),
    path('delete-page/<int:note_id>/<int:page_id>/', note_page_delete_api_view),
]
