from django.shortcuts import render, redirect
from django_user_agents.utils import get_user_agent
import random


def home_page(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')

    return render(request, 'misc/home.html', context={'username': request.user.username})

def welcome_view(request, *args, **kwargs):
    return render(request, 'help/welcome.html')


LANDING_EXPERIMENT_PROBABILITIES = [
    0, # Apply button color
    0, # Order of 'main hook' and 'cool features'
    0.5, # Join us vs apply for alpha
    0.5, # Disable enter email field
    0, # It's free! instead of Register soon!
    0, # Main title control #1
    0.5, # Main title control #2
    0, # Remove Boldface in description
    0, # Hide FA icons
]

def landing_page(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')

    landing_experiment_params = request.session.get('landing_experiment_params')
    user_is_new = False
    if not landing_experiment_params:
        user_is_new = True
        landing_experiment_params = ''.join(['1' if random.random() < prob else '0' for prob in LANDING_EXPERIMENT_PROBABILITIES])
        request.session['landing_experiment_params'] = landing_experiment_params

    return_url = request.GET.get('returnUrl')
    show_login_required = request.GET.get('showLoginRequired')
    ua = request.user_agent
    context = {
        'alpha_spots_remaining': 200,
        'experiment_params': landing_experiment_params,
        'show_login_required': show_login_required,
        'return_url': return_url if return_url else '',
        'user_is_new': user_is_new,
        'user_agent': {
            'device': {
                'family': ua.device.family,
                'is_mobile': ua.is_mobile,
                'is_tablet': ua.is_tablet,
                'is_pc': ua.is_pc,
                'is_bot': ua.is_bot,
            },
            'browser_family': ua.browser.family,
            'os': ua.os.family,
        },
    }
    return render(request, 'landing/landing.html', context=context)