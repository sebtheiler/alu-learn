from rest_framework import serializers

from .models import FreeformNote

class FreeformNoteSerializer(serializers.ModelSerializer):
    version = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FreeformNote
        fields = [
            'title',
            'content',
            'version',
            'id',
        ]

    def get_version(self, obj):
        return 'freeform'