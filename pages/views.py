import random
import os

from django.shortcuts import redirect, render
from django.views.decorators.cache import cache_control, cache_page
from django.views.decorators.vary import vary_on_cookie
from django_user_agents.utils import get_user_agent
from django.http import Http404


@vary_on_cookie
@cache_control(max_age=60*60)
def home_page(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return render(request, 'misc/home.html', context={'username': request.user.username})

@cache_page(timeout=60*60*48) # 2 days - this page will almost never be updated
def welcome_view(request, *args, **kwargs):
    return render(request, 'help/welcome.html')


def md_view_wrapper(path, title, redirect_if_unauth=False):
    @cache_page(timeout=60*60*48)
    def help_view(request, *args, **kwargs):
        if redirect_if_unauth and not request.user.is_authenticated:
            return redirect('/')
        elif not request.user.is_confirmed:
            return redirect('/confirm-email/')

        # Read the MD file from disk, and send it to the template
        # This is a slightly expensive operation, but since this is
        # easily cacheable it doesn't matter too much
        try:
            with open(os.path.join(os.path.join(os.getcwd(), f'pages/markdown/{path}.md')), 'r') as f:
                return render(request, 'help/md-renderer.html', context={
                    'title': title,
                    'content': f.read(),
                })
        except FileNotFoundError as e:
            print(e)
            raise Http404()

    return help_view


def settings_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return render(request, 'misc/settings/settings.html')

def change_email_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    # Even if the user is not confirmed, they can still change email
    
    return render(request, 'misc/settings/change-email.html')

def change_reset_password_view_wrapper(is_reset):
    def change_reset_password_view(request, *args, **kwargs):
        if (is_reset and request.user.is_authenticated) or \
          (not is_reset and not request.user.is_authenticated) or \
          (request.user.is_authenticated and not request.user.is_confirmed):
            return redirect('/confirm-email/')

        return render(request, 'misc/settings/change-reset-password.html', context={'is_reset': is_reset})
    return change_reset_password_view

def confirm_email_view(request, *args, **kwargs):
    if not request.user.is_authenticated or (request.user.is_confirmed and len(request.user.unconfirmed_emails) == 0):
        return redirect('/home/')

    return render(request, 'misc/settings/confirm-email.html', {
        'email': request.user.unconfirmed_emails[0] if request.user.unconfirmed_emails else request.user.email
    })

def send_password_reset(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')

    return render(request, 'misc/settings/send-password-reset.html')

def profile_redirect_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')

    return redirect(f'/profiles/u/{request.user.username}')


@cache_page(timeout=60*15)
def login_view(request, *args, **kwars):
    if request.user.is_authenticated:
        if not request.user.is_confirmed:
            return redirect('/confirm-email/')
        return redirect('/home/')
    
    return render(request, 'profiles/login.html')


def contact_view_wrapper(is_legal_issue):
    def contact_us_view(request, *args, **kwargs):
        return render(request, 'help/contactus.html', context={
            'is_finished': False,
            'user_is_authenticated': request.user.is_authenticated,
            'is_legal_issue': is_legal_issue,
        })
    return contact_us_view

def contact_finished_view_wrapper(is_legal_issue):
    def contact_us_finished_view(request, *args, **kwargs):
        return render(request, 'help/contactus.html', context={'is_finished': True, 'is_legal_issue': is_legal_issue})
    return contact_us_finished_view

def eli_view(request, *args, **kwargs):
    return render(request, 'misc/eli.html')

# def handler404(request, *args, **kwargs):
#     response = render_to_response('misc/404_500.html', {},
#                                   context_instance=RequestContext(request))
#     response.status_code = 404
#     return response


# def handler500(request, *args, **kwargs):
#     response = render_to_response('misc/404_500.html', {},
#                                   context_instance=RequestContext(request))
#     response.status_code = 500
#     return response


LANDING_EXPERIMENT_PROBABILITIES = [
    0, # Apply button color
    0, # Order of 'main hook' and 'cool features'
    0.5, # Join us vs apply for alpha
    0.5, # Disable enter email field
    1.0, # Hide Register soon!
    0, # Main title control #1
    0.5, # Main title control #2
    0, # Remove Boldface in description
    1.0, # Hide FA icons
]

@vary_on_cookie
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
    return render(request, 'misc/landing.html', context=context)
