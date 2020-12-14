from django.urls import path
from .views import (
    short_url_redirect,
)

urlpatterns = [
    path('l/<str:code>/', short_url_redirect),
]