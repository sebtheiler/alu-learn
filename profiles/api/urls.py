from django.urls import path
from utils.api_gen import list_object_view
from ..serializers import HistorySerializer
from . import views

# Base endpoint = /api/profiles/
urlpatterns = [
    path('<str:username>/detail/', views.profile_detail_api_view),
    path('profile/<str:username>/decks/', views.list_profile_decks),
    path('<str:recipient_username>/friend/', views.friend_toggle_api_view),
    path('history/', list_object_view(HistorySerializer, 'profile__user')),
    path('<str:recipient_username>/friendrequest/', views.friend_request_api_view),
    path('notifications/', views.notification_api_view),
    path('notifications/read/', views.notification_read_api_view),
    path('friends/', views.get_user_friends_api_view),
    path('available/', views.check_username_available_api_view),
    path('create/', views.create_profile_api_view),
    path('login/', views.login_api_view),
    path('logout/', views.logout_api_view),
    path('changeemail/', views.change_email),
    path('changepassword/', views.change_password),
    path('resetpassword/<str:email>/', views.password_reset_email_api_view),
    path('confirmemail/<str:username>/', views.confirm_email_api_view),
    path('read-popup/', views.read_changelog_popup_api_view),
    path('staff-force-login/', views.staff_force_login),
    path('streak-review-info/', views.streak_review_info),
]
