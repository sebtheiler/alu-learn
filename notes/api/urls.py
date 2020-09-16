from django.urls import path

from .views import (
    note_create_api_view,
    note_detail_api_view,
    note_update_api_view,
    note_delete_api_view,
)

# Base endpoint = /api/notes/
urlpatterns = [
    path('create/', note_create_api_view),
    path('detail/<int:note_id>/', note_detail_api_view),
    path('update/<int:note_id>/', note_update_api_view),
    path('delete/<int:note_id>/', note_delete_api_view),
]
