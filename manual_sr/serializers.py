from rest_framework import serializers
from .models import ManualSRObject


class ManualSRObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualSRObject
        fields = [
            'title',
            'description',
            'learning_status',
            'steps_index',
            'ease',
            'next_review',
            'interval',
            'id',
        ]
