from typing import List, Union

from django.core.handlers.wsgi import WSGIRequest
from django.db import models
from django.urls import path
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .api_utils import assert_request_data_type, get_obj_or_404


def get_object_view(
    Serializer: serializers.ModelSerializer,
    owner_path: Union[str, None],
):
    """
    Creates an API view for getting a given model

    `Serializer`: Model's serializer (also gives information on the Model)
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['GET'])
    @permission_classes([IsAuthenticated] if owner_path else [])
    def view(request: WSGIRequest, obj_id: int):
        model, got = get_obj_or_404(Model, obj_id, request.user, owner_path)
        if not got:
            return model

        return Response(Serializer(model).data, status=200)

    return view


def list_object_view(
    Serializer: serializers.ModelSerializer,
    owner_path: Union[str, None],
    # TODO: add way to sort
):
    """
    Creates an API view for getting a list of the given model type

    `Serializer`: Model's serializer (also gives information on the Model)
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['GET'])
    @permission_classes([IsAuthenticated] if owner_path else [])
    def view(request: WSGIRequest):
        models = Model.objects.filter(
            **({owner_path: request.user} if owner_path else {}),
        )

        return Response(Serializer(models, many=True).data, status=200)

    return view


def edit_object_view(
    Serializer: serializers.ModelSerializer,
    editable_attrs: List[str],
    owner_path: Union[str, None],
):
    """
    Creates an API view for editing a given model

    `Serializer`: Model's serializer (also gives information on the Model)
    `editable_attrs`: Which attributes you can edit on the Model, for security
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['PUT'])
    @permission_classes([IsAuthenticated])
    def view(request: WSGIRequest, obj_id: int):
        if resp := assert_request_data_type(request, {'edited_values': dict}):
            return resp

        model, got = get_obj_or_404(Model, obj_id, request.user, owner_path)
        if not got:
            return model

        for attr, value in request.data['edited_values'].items():
            if attr not in editable_attrs:
                return Response(
                    {'message': f'Cannot edit attribute `{attr}`'},
                    status=400,
                )

            setattr(model, attr, value)

        model.save()
        return Response(Serializer(model).data, status=200)

    return view


def generate_base_api(
    app_name: str,
    model_name: str,
    Serializer: serializers.ModelSerializer,
    editable_attrs: List[str],
    owner_path: Union[str, None],
    /,
    exclude_app_name: bool = False,
):
    """
    Generate a list of API paths for a model

    `app_name`: Name of the app that houses the model
    `model_name`: Model's lowercase name
    `Serializer`: Model's serializer (also gives information on the Model)
    `editable_attrs`: Which attributes you can edit on the Model, for security
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    `exclude_app_name`: Exclude the app name from the generated URLs
    """
    base_name = f'{app_name}/{model_name}' if not exclude_app_name else f'{model_name}'
    return [
        path(f'{base_name}/<int:obj_id>/', get_object_view(
            Serializer=Serializer,
            owner_path=owner_path,
        )),
        path(f'{base_name}/', list_object_view(
            Serializer=Serializer,
            owner_path=owner_path,
        )),
        path(f'{base_name}/<int:obj_id>/edit/', edit_object_view(
            Serializer=Serializer,
            editable_attrs=editable_attrs,
            owner_path=owner_path,
        )),
    ]
