from django.urls import path

from . import views

# Base endpoint = /api/pages/
urlpatterns = [
    path('contactus/', views.contact_us_api_view),
    path('settings/', views.update_settings_api_view)
]
