from django.urls import path

from . import views

# Base endpoint = /api/deckimporter/
urlpatterns = [
    path('textupload/', views.txt_file_upload),
]