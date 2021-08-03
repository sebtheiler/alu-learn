from typing import List, Literal, Union

from django.core.handlers.wsgi import WSGIRequest
from django.db import models
from django.urls import path
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .api_utils import get_obj_or_404
from .utils import assert_dict_data_type


def create_object_view(
    Serializer: serializers.ModelSerializer,
    editable_attrs: List[str],
    owner_path: str,
    owner_type: Literal['USER', 'PROFILE']
):
    """
    Creates an API view for creating a given model

    `Serializer`: Model's serializer (also gives information on the Model)
    `editable_attrs`: Dictionary mapping the model's editable attributes to their types
        ({'title': str, 'num': int})
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def view(request: WSGIRequest):
        if msg := assert_dict_data_type(request.data, editable_attrs):
            return Response({'message': msg}, status=400)

        model = Model.objects.create(
            **{owner_path: request.user if owner_type == 'USER' else request.user.profile},
            **request.data,
        )

        return Response(Serializer(model).data, status=201)

    return view


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
        model, got = get_obj_or_404(
            Model=Model,
            obj_id=obj_id,
            user=request.user,
            owner_path=owner_path,
        )
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
    editable_attrs: dict,
    owner_path: Union[str, None],
):
    """
    Creates an API view for editing a given model

    `Serializer`: Model's serializer (also gives information on the Model)
    `editable_attrs`: Dictionary mapping the model's editable attributes to their types
        ({'title': str, 'num': int})
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['PUT'])
    @permission_classes([IsAuthenticated])
    def view(request: WSGIRequest, obj_id: int):
        model, got = get_obj_or_404(Model, obj_id, request.user, owner_path)
        if not got:
            return model

        for attr, value in request.data.items():
            if (
                attr not in editable_attrs.keys() or
                not isinstance(attr, editable_attrs[attr])
            ):
                return Response(
                    {'message': f'Cannot edit attribute `{attr}` as {type(attr)}'},
                    status=400,
                )

            setattr(model, attr, value)

        model.save()
        return Response(Serializer(model).data, status=200)

    return view


def delete_object_view(
    Serializer: serializers.ModelSerializer,
    owner_path: str,
):
    """
    Creates an API view for deleting a given model

    `Serializer`: Model's serializer (also gives information on the Model)
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    """
    Model = Serializer.Meta.model  # type: models.Model

    @api_view(['DELETE'])
    @permission_classes([IsAuthenticated])
    def view(request: WSGIRequest, obj_id: int):
        model, got = get_obj_or_404(Model, obj_id, request.user, owner_path)
        if not got:
            return model

        model.delete()

        return Response({'message': 'Object deleted'}, status=200)

    return view


def generate_base_api(
    app_name: str,
    model_name: str,
    Serializer: serializers.ModelSerializer,
    editable_attrs: dict,
    owner_path: Union[str, None],
    owner_type: Literal['USER', 'PROFILE'],
    /,
    exclude_app_name: bool = False,
    exclude_create: bool = False,
    exclude_get: bool = False,
    exclude_list: bool = False,
    exclude_edit: bool = False,
    exclude_delete: bool = False,
):
    """
    Generate a list of API paths for a model

    `app_name`: Name of the app that houses the model
    `model_name`: Model's lowercase name
    `Serializer`: Model's serializer (also gives information on the Model)
    `editable_attrs`: Dictionary mapping the model's editable attributes to their types
        ({'title': str, 'num': int})
    `owner_path`: Path/attribute to get the objects owner
        ('user', 'profile.user', 'deck__user')
    `exclude_app_name`: Exclude the app name from the generated URLs
    `exclude_create ... exclude_delete`: Don't add a view for that function
    """
    base_name = f'{app_name}/{model_name}' if not exclude_app_name else f'{model_name}'
    views = []

    if not exclude_create:
        views.append(
            path(f'{base_name}/create/', create_object_view(
                Serializer=Serializer,
                editable_attrs=editable_attrs,
                owner_path=owner_path,
                owner_type=owner_type,
            ))
        )

    if not exclude_get:
        views.append(
            path(f'{base_name}/<int:obj_id>/', get_object_view(
                Serializer=Serializer,
                owner_path=owner_path,
            ))
        )

    if not exclude_list:
        views.append(
            path(f'{base_name}/list/', list_object_view(
                Serializer=Serializer,
                owner_path=owner_path,
            ))
        )

    if not exclude_edit:
        views.append(
            path(f'{base_name}/<int:obj_id>/edit/', edit_object_view(
                Serializer=Serializer,
                editable_attrs=editable_attrs,
                owner_path=owner_path,
            ))
        )

    # TODO: add rearrange view

    if not exclude_delete:
        views.append(
            path(f'{base_name}/<int:obj_id>/delete/', delete_object_view(
                Serializer=Serializer,
                owner_path=owner_path,
            ))
        )
    return views
