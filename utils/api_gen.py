from typing import List, Union

from django.core.handlers.wsgi import WSGIRequest
from django.db import models
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .api_utils import assert_request_data_type


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

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def view(request: WSGIRequest, obj_id: int):
        if resp := assert_request_data_type(request, {'edited_values': dict}):
            return resp

        try:
            model = Model.objects.get(
                pk=obj_id,
                **({owner_path: request.user} if owner_path else {}),
            )
        except Model.DoesNotExist:
            return Response(
                {'message': f'{type(Model)} not found'},
                status=404,
            )

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
