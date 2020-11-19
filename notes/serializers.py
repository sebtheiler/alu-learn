from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from .models import FreeformNotePage, CornellNotePage, CornellNotePageSection, NotePage


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



class FreeformNotePageSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)

    class Meta:
        model = FreeformNotePage
        fields = NoteSerializer.Meta.fields + [
            'content',
        ]

    def get_serializer_name(self, obj):
        return 'note-standard'


class CornellNotePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CornellNotePageSection
        fields = [
            'cue',
            'content',
            'id',
        ]


class CornellNotePageSerializer(serializers.ModelSerializer):
    author = MinifiedProfileSerializer(source='user', read_only=True)
    sections = CornellNotePageSectionSerializer(many=True, read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CornellNotePage
        fields = NoteSerializer.Meta.fields + [
            'sections',
            'summary',
        ]
    
    def get_serializer_name(self, obj):
        return 'note-cornell'


class NotePageSerializer(serializers.ModelSerializer):
    page = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NotePage
        fields = [
            'page',
            'title',
            'id',
        ]

    def get_page(self, obj):
        try:
            FreeformNotePage.objects.get(pk=obj.id)
            return FreeformNotePageSerializer(obj)
        except FreeformNotePage.DoesNotExist:
            try:
                CornellNotePage.objects.get(pk=obj.id)
                return CornellNotePageSerializer(obj)
            except CornellNotePageSerializer.DoesNotExist:
                raise ValueError(f'Could not find note page with id "{obj.id}"')


class FullNoteSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)
    pages = NotePageSerializer(source='pages', many=True, read_only=True)

    class Meta:
        model = FreeformNotePage
        fields = [
            'author',
            'title',
            'serializer_name',
            'pages',
            'id',
        ]

    def get_serializer_name(self, obj):
        return 'note-base'
