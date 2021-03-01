from django.urls import path

from .views import (
    change_email, profile_detail_api_view,
    notification_api_view,
    notification_read_api_view,
    friend_request_api_view,
    friend_toggle_api_view,
    check_username_available_api_view,
    create_profile_api_view,
    login_api_view,
    logout_api_view,
    get_user_friends_api_view,
    profile_history_view,
    change_password,
    confirm_email_api_view,
    password_reset_email_api_view,
    read_changelog_popup_api_view,
    staff_force_login,
)

# Base endpoint = /api/profiles/
urlpatterns = [
    path('<str:username>/detail/', profile_detail_api_view),
    path('<str:recipient_username>/friend/', friend_toggle_api_view),
    path('<str:username>/history/', profile_history_view),
    path('<str:recipient_username>/friendrequest/', friend_request_api_view),
    path('notifications/', notification_api_view),
    path('notifications/read/', notification_read_api_view),
    path('friends/', get_user_friends_api_view),
    path('available/', check_username_available_api_view),
    path('create/', create_profile_api_view),
    path('login/', login_api_view),
    path('logout/', logout_api_view),
    path('changeemail/', change_email),
    path('changepassword/', change_password),
    path('resetpassword/<str:email>/', password_reset_email_api_view),
    path('confirmemail/<str:username>/', confirm_email_api_view),
    path('read-popup/', read_changelog_popup_api_view),
    path('staff-force-login/', staff_force_login),
]
