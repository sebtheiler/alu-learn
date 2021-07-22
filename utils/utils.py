import datetime as dt
import random
from typing import List

from django.http import Http404
from django.shortcuts import redirect, render
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Helper function for pagination
def get_paginated_queryset_response(
    qs,
    request,
    Serializer,
    page_size: int = 50,
    other_information: dict = {},
) -> Response:
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    if isinstance(Serializer, dict):
        serialized = [Serializer[type(instance)](instance).data for instance in paginated_qs]
    else:
        serialized = Serializer(paginated_qs, many=True).data

    paginated_resp = paginator.get_paginated_response(serialized)
    return Response({**paginated_resp.data, **other_information}, status=200)


# Like random.choices, but without replacement
# Taken from https://stackoverflow.com/a/61605842/13042142
def weighted_sample(population, weights, k=1) -> List[int]:
    k = min(k, len(population))
    weights = list(weights)
    positions = range(len(population))
    indices = []
    while True:
        needed = k - len(indices)
        if not needed:
            break
        for i in random.choices(positions, weights, k=needed):
            if weights[i]:
                weights[i] = 0.0
                indices.append(i)
    return [population[i] for i in indices]


# Decorator for non-API views
def permissions(
    is_authenticated: bool = True,
    is_confirmed: bool = True,
    is_staff: bool = False,
):
    """
    Ensures the user has the specified permissions, or otherwise redirects them
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            request = args[0]

            if is_authenticated and not request.user.is_authenticated:
                return redirect('/')
            elif is_confirmed and not request.user.is_confirmed:
                return redirect('/confirm-email/')
            elif is_staff and not request.user.is_staff:
                raise Http404('Permission denied')

            return func(*args, **kwargs)
        return wrapper
    return decorator


# Renders a view that has an HTML file, given some permissions
def render_basic_view(
    html_location: str,
    is_authenticated: bool = True,
    is_confirmed: bool = True,
    is_staff: bool = False,
    context_kwargs: bool = True
):
    @permissions(is_authenticated, is_confirmed, is_staff)
    def render_view(request, *args, **kwargs):
        return render(request, html_location, context=kwargs if context_kwargs else {})

    return render_view


# Creates a basic SlateJS Element
def create_slate_element(inner_text: str):
    return [
        {
            "type": "paragraph",
            "children": [
                {
                    "text": inner_text
                },
            ],
        },
    ]


BLANK_SLATE_ELEMENT = create_slate_element('')


def get_morning() -> dt.datetime:
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

    return this_morning
