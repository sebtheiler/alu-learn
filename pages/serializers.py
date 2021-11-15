from rest_framework import serializers
from .models import UploadedImage


class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = (
            'image',
            'description',
            'original_url',
            'field_number',
            'id',
        )
