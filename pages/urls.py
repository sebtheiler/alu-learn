from django.urls import path

from . import views
urlpatterns = [
    path('home/', views.home_page),
    path('settings/', views.settings_view),
    path('profile/', views.profile_redirect_view),
    path('login/', views.login_view),
    path('contactus/', views.contact_view_wrapper(is_legal_issue=False)),
    path('contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=False)),
    path('legal/contactus/', views.contact_view_wrapper(is_legal_issue=True)),
    path('legal/contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=True)),
    path('help/welcome/', views.welcome_view),
]
