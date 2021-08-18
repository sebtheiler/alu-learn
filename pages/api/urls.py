from django.urls import path

from . import views
import analytics.api.views as analytics_views

# Base endpoint = /api/pages/
urlpatterns = [
    path('contactus/', views.contact_us_api_view),
    path('settings/', views.update_settings_api_view),
    # path('explore/lists/', views.api_explore_lists_view),
    path('feedback/get-question/', analytics_views.get_quick_feedback_question),
    path('feedback/<int:quick_feedback_id>/respond/', analytics_views.respond_to_feedback_question)
]
