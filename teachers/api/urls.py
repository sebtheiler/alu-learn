from django.urls import path

from . import views

urlpatterns = [
    path('classroom/list/', views.classrooms_list),
    path('classroom/create/', views.create_classroom_view),
    path('classroom/join/', views.student_join_class_view),
    path('classroom/<int:classroom_id>/', views.classroom_detail_view),
    path('classroom/<int:classroom_id>/attach/', views.teacher_attach_deck_view),
    path('classroom/<int:classroom_id>/students/', views.classroom_students_view),
    path('assignment/create/', views.create_assignment),
]
