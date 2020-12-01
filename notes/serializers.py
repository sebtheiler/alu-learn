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
    note_page_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FreeformNotePage
        fields = [
            'content',
            'title',
            'page_number',
            'note_page_type',
            'id',
        ]

    def get_note_page_type(self, obj):
        return 'STND'


class CornellNotePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CornellNotePageSection
        fields = [
            'cue',
            'content',
            'id',
        ]


class CornellNotePageSerializer(serializers.ModelSerializer):
    sections = CornellNotePageSectionSerializer(many=True, read_only=True)
    note_page_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CornellNotePage
        fields = [
            'title',
            'page_number',
            'sections',
            'summary',
            'note_page_type',
            'id',
        ]
    
    def get_note_page_type(self, obj):
        return 'CORN'


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
            note = FreeformNotePage.objects.get(pk=obj.id)
            return FreeformNotePageSerializer(note).data
        except FreeformNotePage.DoesNotExist:
            try:
                note = CornellNotePage.objects.get(pk=obj.id)
                return CornellNotePageSerializer(note).data
            except CornellNotePageSerializer.DoesNotExist:
                raise ValueError(f'Could not find note page with id "{obj.id}"')


class FullNoteSerializer(serializers.ModelSerializer):
    serializer_name = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer(source='user', read_only=True)
    pages = serializers.SerializerMethodField(read_only=True)

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

    def get_pages(self, obj):
        return NotePageSerializer(obj.pages.all().order_by('page_number'), many=True).data
