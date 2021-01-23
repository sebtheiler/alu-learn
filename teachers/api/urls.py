from django.urls import path

from . import views

urlpatterns = [
    path('classroom/create/', views.create_classroom_view),
    path('classroom/homepage/', views.classrooms_homepage_view),
    path('classroom/edit/', views.edit_classroom_view),
    path('classroom/delete/', views.delete_classroom_view),
]
