from django.urls import path

from .views import *

urlpatterns = [
    path('home/manual-sr/', manual_sr_home_view),
]
