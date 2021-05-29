from django.urls import path
from utils import render_basic_view
# from .views import (

# )

urlpatterns = [
    path('home/habits/', render_basic_view('habits/home.html')),
]
