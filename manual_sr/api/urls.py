from django.urls import path

from . import views

# Base endpoint = /api/manual-sr/
app_names = 'explore'
urlpatterns = [
    path('list/', views.manual_sr_list_view),
    path('create/', views.manual_sr_create_view),
    path('delete/', views.manual_sr_delete_view),
]
