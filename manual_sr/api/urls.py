from manual_sr.api.views import manual_sr_update_view
from django.urls import path

from . import views

# Base endpoint = /api/manual-sr/
app_names = 'explore'
urlpatterns = [
    path('create/', views.manual_sr_create_view),
    path('list/', views.manual_sr_list_view),
    path('update/<int:manual_sr_id>/', views.manual_sr_update_view),
    path('edit/<int:manual_sr_id>/', views.manual_sr_edit_view),
    path('delete/', views.manual_sr_delete_view),
]
