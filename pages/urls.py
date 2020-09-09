from django.urls import path

from . import views
urlpatterns = [
    path('home/', views.home_page),
    path('settings/', views.settings_view),
    path('profile/', views.profile_redirect_view),
    path('login/', views.login_view),
    path('contactus/', views.contact_us_view),
    path('contactus/finished/', views.contact_us_finished_view),
    path('help/welcome/', views.welcome_view),
]
