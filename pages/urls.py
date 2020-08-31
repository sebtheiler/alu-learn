from django.urls import path

from . import views
urlpatterns = [
    path('help/welcome/', views.welcome_view),
]
