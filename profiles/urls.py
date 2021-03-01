from django.urls import path
from utils import render_basic_view
from .views import (
    profile_detail_view,
    profile_update_view,
)

urlpatterns = [
    path('edit/', profile_update_view),
    path('u/<str:username>/', profile_detail_view),
    path('notifications/', render_basic_view('profiles/notifications.html')),
    path('staff-force-login-123/', render_basic_view('profiles/staff-login.html', False, False, True)),
]
