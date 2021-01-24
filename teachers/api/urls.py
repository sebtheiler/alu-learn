from django.urls import path

from . import views

urlpatterns = [
    path('classroom/create/', views.create_classroom_view),
    path('classroom/homepage/', views.classrooms_homepage_view),
    path('classroom/edit/', views.edit_classroom_view),
    path('classroom/delete/', views.delete_classroom_view),
    path('classroom/student-join/', views.student_join_class_view),
    path('classroom/joined/', views.student_joined_classes_view),
    path('classroom/detail/<int:classroom_id>/', views.classroom_detail_view),
    path('classroom/students/<int:classroom_id>/', views.classroom_students_view),
    path('classroom/attach-deck/<int:classroom_id>/', views.attach_deck_view),
]
