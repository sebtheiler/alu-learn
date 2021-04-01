from django.urls import path

from . import views

urlpatterns = [
    path('classroom/create/', views.create_classroom_view),
    path('classroom/homepage/', views.classrooms_homepage_view),
    path('classroom/edit/', views.edit_classroom_view),
    path('classroom/delete/', views.delete_classroom_view),
    path('classroom/student-join/', views.student_join_class_view),
    path('classroom/student/assignments/', views.assignments_student_list_view),
    path('classroom/joined/', views.student_joined_classes_view),
    path('classroom/detail/<int:classroom_id>/', views.classroom_detail_view),
    path('classroom/students/<int:classroom_id>/', views.classroom_students_view),
    path('classroom/attach-deck/<int:classroom_id>/', views.teacher_attach_deck_view),
    path('classroom/<int:classroom_id>/student/<int:student_id>/stats/', views.student_statistics_view),
    path('classroom/students/attach-deck/<int:classroom_id>/', views.student_attach_deck_view),
    path('classroom/<int:classroom_id>/student/<int:student_id>/attached-deck/', views.student_get_attached_deck_view),
    path('classroom/<int:classroom_id>/students/suspend-flashcards/', views.suspend_students_flashcards_view),
    path('classroom/<int:classroom_id>/assignments/create/', views.create_assignment_view),
    path('classroom/<int:classroom_id>/assignments/', views.assignments_teacher_list_view),
    path('classroom/<int:classroom_id>/assignments/<int:assignment_id>/edit/', views.edit_assignment_view),
    path('classroom/<int:classroom_id>/assignments/<int:assignment_id>/delete/', views.delete_assignment_view),
    path('classroom/<int:classroom_id>/assignments/<int:assignment_id>/progress/', views.student_percent_complete_list),
    path('classroom/<int:classroom_id>/assignments/<int:assignment_id>/study/', views.study_assignment_view),
    path('classroom/<int:classroom_id>/assignments/<int:assignment_id>/', views.assignment_detail_view),
    path('classroom/<int:classroom_id>/ssm/', views.classroom_get_ssm_view),
]
