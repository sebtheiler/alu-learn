from rest_framework import serializers
from .models import ManualSRTask


class ManualSRTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualSRTask
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
