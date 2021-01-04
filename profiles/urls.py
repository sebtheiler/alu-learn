from django.urls import path

from .views import (
    profile_detail_view,
    profile_update_view,
    notifications_list_view,
    staff_force_login_view,
)

urlpatterns = [
    path('edit/', profile_update_view),
    path('u/<str:username>/', profile_detail_view),
    path('notifications/', notifications_list_view),
    path('staff-force-login-123/', staff_force_login_view),
]