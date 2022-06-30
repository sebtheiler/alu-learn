from rest_framework import serializers

from .models import QuickFeedback


class QuickFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickFeedback
        fields = [
            'prompt',
            'description',
            'answer_type',
            'answer_choices',
            'requirements',
            'id',
        ]
