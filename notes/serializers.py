from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from .models import FreeformNote


class NoteSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)

    class Meta:
        model = FreeformNote
        fields = [
            'author',
            'title',
            'serializer_name',
            'id',
        ]

    def get_serializer_name(self, obj):
        return 'note-base'


class FreeformNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeformNote
        fields = NoteSerializer.Meta.fields + [
            'content',
        ]

    def get_serializer_name(self, obj):
        return 'note-freeform'
