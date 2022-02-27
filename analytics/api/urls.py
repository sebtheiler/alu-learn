from django.urls import path

from . import views

# Base endpoint = /api/analytics/
urlpatterns = [
    # path('feedback/get-question/', views.get_quick_feedback_question),
    # path('feedback/<int:quick_feedback_id>/respond/', views.respond_to_feedback_question)
    path('collect-welcome-info/', views.collect_user_welcome_info),
]
