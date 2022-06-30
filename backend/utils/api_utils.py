from typing import Tuple, Union

from accounts.models import User
from django.core.handlers.wsgi import WSGIRequest
from django.db import models
from django.http import Http404
from django.shortcuts import redirect, render
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .utils import assert_dict_data_type


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

            # We use `getattr` because `AnonymousUser`s don't have these attrs
            if is_authenticated and not getattr(request.user, 'is_authenticated', False):
                return redirect('/')
            elif is_confirmed and not getattr(request.user, 'is_confirmed', False):
                return redirect('/confirm-email/')
            elif is_staff and not getattr(request.user, 'is_staff', False):
                raise Http404('Permission denied')

            return func(*args, **kwargs)
        return wrapper
    return decorator


def render_basic_view(
    html_location: str,
    is_authenticated: bool = True,
    is_confirmed: bool = True,
    is_staff: bool = False,
    context_kwargs: bool = True
):
    """
    Renders a view that has an HTML file, given some permissions

    If specified `context_kwargs` replaces the default kwargs as context to the rendered view
    """
    @permissions(is_authenticated, is_confirmed, is_staff)
    def render_view(request, *args, **kwargs):
        return render(request, html_location, context=kwargs if context_kwargs else {})

    return render_view


# Helper function for pagination
def get_paginated_queryset_response(
    qs,
    request,
    Serializer,
    page_size: int = 50,
    other_information: dict = {},
) -> Response:
    """
    Paginates a response

    qs: QuerySet to paginate
    request: Request to paginate with
    Serializer: Serializer object to serialize the results with
        If passed as a dict ({type1: Serializer1, type2: Serializer2})
        uses each Serializer for different types  TODO: remove this option
    page_size: Maximum number of objects in a page
    other_information: TODO: probably remove
    """
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    if isinstance(Serializer, dict):
        serialized = [Serializer[type(instance)](instance).data for instance in paginated_qs]
    else:
        serialized = Serializer(paginated_qs, many=True).data

    paginated_resp = paginator.get_paginated_response(serialized)
    return Response({**paginated_resp.data, **other_information}, status=200)


def assert_request_data_type(
    request: WSGIRequest,
    attr_types: dict,
    enforce_all_keys_equal: bool = True,
) -> Union[Response, None]:
    """
    Asserts that each specified item in `request` is of the type sepcified by `attr_types`

    `attr_types` maps string attributes to types ({'options': dict, 'obj_id': (int, str)})
    """
    if msg := assert_dict_data_type(request.data, attr_types, enforce_all_keys_equal):
        return Response({'message': msg}, status=400)

    return None


def get_obj_or_404(
    Model: models.Model,
    obj_id: Union[int, str],
    user: Union[User, None],
    owner_path: Union[str, None],
) -> Tuple[Union[models.Model, None], Union[Response, None]]:
    """
    Either gets a model or returns a 404 response

    Model: model type of the object to get
    obj_id: ID of the object to get
    user: If specified, the owner of the object
    `owner_path`: Path/attribute to get the objects `user`
        ('user', 'profile.user', 'deck__user')

    Returns the model OR 404 response, AND whether or not the model was returned
    """
    try:
        return Model.objects.get(
            pk=obj_id,
            **({owner_path: user} if owner_path else {}),
        ), None
    except Model.DoesNotExist:
        return None, Response(
            {'message': f'{type(Model)} not found'},
            status=404,
        )


class IsPro(BasePermission):
    """
    Allows access only to Pro Mode users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_pro
        )
