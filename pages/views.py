from django.shortcuts import render


def welcome_view(request, *args, **kwargs):
    return render(request, 'help/welcome.html')