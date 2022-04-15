from django.core.handlers.wsgi import WSGIRequest
from django.http.response import Http404
from django.shortcuts import redirect

from .models import ShortUrl, UrlHit


# https://stackoverflow.com/a/4581997/13042142
# Not a foolproof function, and should NOT be used for sensitive information
def get_client_ip(request: WSGIRequest) -> str:
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    return ip


def short_url_redirect(request, code, *args, **kwargs) -> redirect:
    try:
        short_url = ShortUrl.objects.get(code=code)
    except ShortUrl.DoesNotExist:
        raise Http404()

    try:
        user = request.user.profile
    except AttributeError:
        user = None

    UrlHit.objects.create(
        url=short_url,
        user=user,
        user_agent=request.user_agent,
        ip_address=get_client_ip(request),
        referer=request.META.get('HTTP_REFERER'),
    )

    return redirect(short_url.destination)
