from decks.serializers import FlashcardActionSerializer
from profiles.serializers import MinifiedProfileSerializer
from rest_framework import serializers
from skill_tree.serializers import (MainSectionActionSerializer,
                                    MainSectionSerializer,
                                    SubSectionActionSerializer)

from .models import SharedDeck, SnapShot, SubmittedChanges


class SnapShotSerializer(serializers.ModelSerializer):
    author = MinifiedProfileSerializer('author')
    main_sections = MainSectionSerializer('main_sections', many=True)

    class Meta:
        model = SnapShot
        fields = (
            'author',
            'message',
            'timestamp',
            'main_sections',
            'id',
        )


class SubmittedChangesSerializer(serializers.ModelSerializer):
    # We need to use `serializers.SerializerMethodField` so that we forward our context
    # (used for `full_detail: True`)
    pending_mainsectionactions = serializers.SerializerMethodField(read_only=True)
    pending_subsectionactions = serializers.SerializerMethodField(read_only=True)
    pending_flashcardactions = serializers.SerializerMethodField(read_only=True)
    author = MinifiedProfileSerializer('author')

    class Meta:
        model = SubmittedChanges
        fields = (
            'message',
            'author',
            'pending_mainsectionactions',
            'pending_subsectionactions',
            'pending_flashcardactions',
            'id',
        )

    def get_pending_mainsectionactions(self, obj):
        return MainSectionActionSerializer(
            obj.pending_mainsectionactions.all(),
            many=True,
            context=self.context,
        ).data

    def get_pending_subsectionactions(self, obj):
        return SubSectionActionSerializer(
            obj.pending_subsectionactions.all(),
            many=True,
            context=self.context,
        ).data

    def get_pending_flashcardactions(self, obj):
        return FlashcardActionSerializer(
            obj.pending_flashcardactions.all(),
            many=True,
            context=self.context,
        ).data


class SharedDeckSerializer(serializers.ModelSerializer):
    owners = MinifiedProfileSerializer('owners', many=True)
    snapshots = SnapShotSerializer('snapshots', many=True)

    has_view_access = serializers.SerializerMethodField(read_only=True)
    has_edit_access = serializers.SerializerMethodField(read_only=True)
    is_owner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SharedDeck
        fields = (
            'title',
            'description',
            'view_access',
            'edit_access',
            'owners',
            'snapshots',
            'has_view_access',
            'has_edit_access',
            'is_owner',
            'id',
        )

    def get_has_view_access(self, obj):
        return True  # if the user is viewing this response, they have view access

    def get_has_edit_access(self, obj):
        request = self.context.get('request')
        if request is None:
            return
        return obj.has_edit_access(
            request.user.profile.pk if request.user.is_authenticated else None
        )

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return
        return obj.is_owner(
            request.user.profile.pk if request.user.is_authenticated else None
        )
