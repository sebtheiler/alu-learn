from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from .models import FreeformNotePage, CornellNotePage, CornellNotePageSection


class NoteSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)

    class Meta:
        model = FreeformNotePage
        fields = [
            'author',
            'title',
            'serializer_name',
            'id',
        ]

    def get_serializer_name(self, obj):
        return 'note-base'


class FreeformNoteSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)

    class Meta:
        model = FreeformNotePage
        fields = NoteSerializer.Meta.fields + [
            'content',
        ]

    def get_serializer_name(self, obj):
        return 'note-standard'


class CornellNoteSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CornellNotePageSection
        fields = [
            'cue',
            'content',
            'id',
        ]


class CornellNoteSerializer(serializers.ModelSerializer):
    author = MinifiedProfileSerializer(source='user', read_only=True)
    sections = CornellNoteSectionSerializer(many=True, read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CornellNotePage
        fields = NoteSerializer.Meta.fields + [
            'sections',
            'summary',
        ]
    
    def get_serializer_name(self, obj):
        return 'note-cornell'
