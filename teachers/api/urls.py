from django.urls import path

from . import views

urlpatterns = [
    path('assignment/create/', views.create_assignment),
    path('assignment/<int:assignment_id>/edit/', views.edit_assignment_view),
    path('assignment/<int:assignment_id>/get-deck/', views.assignment_get_deck_view),
    path('classroom/create/', views.create_classroom_view),
    path('classroom/join/', views.student_join_class_view),
    path('classroom/taught-list/', views.classrooms_taught_list),
    path('classroom/in-list/', views.classrooms_in_list),
    path('classroom/<int:classroom_id>/', views.classroom_detail_view),
    path('classroom/<int:classroom_id>/assignments/', views.assignments_teacher_list_view),
    path('classroom/<int:classroom_id>/attach/', views.teacher_attach_deck_view),
    path('classroom/<int:classroom_id>/percent-complete/', views.classroom_percent_complete),
    path(
        'classroom/<int:classroom_id>/assignments/<int:assignment_id>/percent-complete/',
        views.assignment_percent_complete,
    ),
    path('classroom/<int:classroom_id>/students/', views.classroom_students_view),
]
