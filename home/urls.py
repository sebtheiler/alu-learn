from django.urls import path
from . import views

app_names = 'home'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]