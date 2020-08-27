from django.shortcuts import render, redirect


def landing_page(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')
    context = {
        'alpha_spots_remaining': 200,
    }
    return render(request, 'landing/landing.html', context=context)