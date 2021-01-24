from django.http.response import Http404
from .models import Classroom
from django.shortcuts import render, redirect


# Rendered when the teacher is viewing their homepage
def classroom_homepage(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return render(request, 'teachers/home.html')


# Rendered when the teacher is viewing a specific class
def classroom_detail(request, classroom_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    try:
        classroom = Classroom.objects.get(pk=classroom_id, teachers=request.user.profile)
    except Classroom.DoesNotExist:
        raise Http404('Class not found')

    return render(request, 'teachers/detail.html', context={
        'classroom_name': classroom.title, 'classroom_id': classroom_id
    })