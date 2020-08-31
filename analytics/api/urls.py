from django.urls import path

from . import views

# Base endpoint = /api/analytics/
urlpatterns = [
    path('createblank/', views.create_blank_experiment_api_view),
]
