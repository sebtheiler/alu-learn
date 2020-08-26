from django.shortcuts import render, redirect


def landing_page(request, *args, **kwargs):
    # if request.user.is_authenticated:
    #     return redirect('/home/')
    return render(request, 'landing/landing.html')