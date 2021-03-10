from django.http.response import Http404
from .models import Classroom
from django.shortcuts import render
from utils import permissions


# Rendered when the teacher is viewing a specific class
@permissions()
def classroom_detail(request, classroom_id, *args, **kwargs):
    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        raise Http404('Class not found')

    return render(request, 'teachers/detail.html', context={
        'classroom_name': classroom.title, 'classroom_id': classroom_id
    })


# Rendered when a student is viewing a class they are in
@permissions()
def classroom_student_detail(request, classroom_id, *args, **kwargs):
    try:
        classroom = Classroom.objects.get(pk=classroom_id, students=request.user.profile)
    except Classroom.DoesNotExist:
        raise Http404('Class not found')

    return render(request, 'teachers/student-detail.html', context={
        'classroom_name': classroom.title, 'classroom_id': classroom_id
    })


@permissions()
def classroom_assignment_study(request, classroom_id, assignment_id, *args, **kwargs):
    return render(request, 'teachers/assignment-study.html', context={
        'classroom_id': classroom_id, 'assignment_id': assignment_id
    })
