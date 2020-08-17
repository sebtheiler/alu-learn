from django.urls import path

from .views import (
    explore_home_view,
)

urlpatterns = [
    path('', explore_home_view),
]