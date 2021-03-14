from django.urls import path

from .views import (
    classroom_detail,
    classroom_student_detail,
    classroom_assignment_study,
)

urlpatterns = [
    path('classrooms/<int:classroom_id>/', classroom_detail),
    path('classrooms/<int:classroom_id>/student/', classroom_student_detail),
    path('classrooms/<int:classroom_id>/assignments/<int:assignment_id>/study/', classroom_assignment_study),
]
