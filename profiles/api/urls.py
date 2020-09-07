from django.urls import path

from .views import (
    profile_detail_api_view,
    notification_api_view,
    notification_read_api_view,
    friend_request_api_view,
    profile_badge_create_api_view,
    check_username_available_api_view,
    create_profile_api_view,
    login_api_view,
    logout_api_view,
    get_user_friends_api_view,
    profile_history_view,
    # test_my_email_api_view,
)

# Base endpoint = /api/profiles/
urlpatterns = [
    path('<str:username>/detail/', profile_detail_api_view),
    path('<str:username>/friend/', profile_detail_api_view),
    path('<str:username>/friends/', get_user_friends_api_view),
    path('<str:username>/givebadge/', profile_badge_create_api_view),
    path('<str:username>/history/', profile_history_view),
    path('<str:recipient_username>/friendrequest/', friend_request_api_view),
    path('<str:username>/notifications/', notification_api_view),
    path('<str:username>/notifications/read/', notification_read_api_view),
    path('available/', check_username_available_api_view),
    path('create/', create_profile_api_view),
    path('login/', login_api_view),
    path('logout/', logout_api_view),
    # path('emailtest/', test_my_email_api_view)
]
