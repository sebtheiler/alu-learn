from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from .models import Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    teacher = MinifiedProfileSerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            'title',
            'code',
            'teacher',
            'id',
        ]
