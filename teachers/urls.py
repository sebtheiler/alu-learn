from django.urls import path

from .views import *

urlpatterns = [
    path('home/classrooms/', classroom_homepage),
    path('classrooms/<int:classroom_id>/', classroom_detail),
    path('classrooms/<int:classroom_id>/student/', classroom_student_detail),
]