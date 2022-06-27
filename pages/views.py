import os

from django.http import Http404
from django.shortcuts import redirect, render
from django.views.decorators.cache import cache_control, cache_page
from django.views.decorators.vary import vary_on_cookie
from profiles.api.views import give_user_organization_pro_mode
from utils import permissions


@vary_on_cookie
@cache_control(max_age=60*60)
@permissions()
def home_page(request, *args, **kwargs):
    return render(request, 'misc/home.html', context={'username': request.user.username})


def md_view_wrapper(path, title, redirect_if_unauth=False):
    @cache_page(timeout=60*60*48)
    def help_view(request, *args, **kwargs):
        if redirect_if_unauth and not request.user.is_authenticated:
            return redirect('/')
        elif request.user.is_authenticated and not request.user.is_confirmed:
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


def change_reset_password_view_wrapper(is_reset):
    def change_reset_password_view(request, *args, **kwargs):
        if (is_reset and request.user.is_authenticated) or \
          (not is_reset and not request.user.is_authenticated) or \
          (request.user.is_authenticated and not request.user.is_confirmed):
            return redirect('/confirm-email/')

        return render(request, 'misc/settings/change-reset-password.html', context={'is_reset': is_reset})

    return change_reset_password_view


def confirm_email_view(request, *args, **kwargs):
    if confirmation_key := request.GET.get('confirmation_key'):
        if request.user.confirm_email(confirmation_key):
            # If the user is a member of a partnered organization, they get pro for free
            give_user_organization_pro_mode(request.user)

        return redirect('/home/')

    if not request.user.is_authenticated or request.user.is_confirmed:
        return redirect('/home/')

    return render(request, 'misc/settings/confirm-email.html')


def send_password_reset(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')

    return render(request, 'misc/settings/send-password-reset.html')


@permissions()
def profile_redirect_view(request, *args, **kwargs):
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


@cache_page(timeout=60*30)
def landing_page(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')

    return_url = request.GET.get('returnUrl')
    show_login_required = request.GET.get('showLoginRequired')
    context = {
        'show_login_required': show_login_required,
        'return_url': return_url if return_url else '',
    }
    return render(request, 'misc/landing.html', context=context)


# Explore page
@cache_page(60*15)
def explore_home_view(request, *args, **kwargs):
    return render(request, 'explore/explore.html')
