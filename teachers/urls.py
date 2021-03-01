from utils.utils import render_basic_view
from django.urls import path

from .views import *

urlpatterns = [
    path('home/classrooms/', render_basic_view('teachers/home.html')),
    path('classrooms/<int:classroom_id>/', classroom_detail),
    path('classrooms/<int:classroom_id>/student/', classroom_student_detail),
    path('classrooms/<int:classroom_id>/assignments/<int:assignment_id>/study/', classroom_assignment_study),
]
