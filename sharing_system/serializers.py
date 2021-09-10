from profiles.serializers import MinifiedProfileSerializer
from rest_framework import serializers
from skill_tree.serializers import MainSectionSerializer

from .models import SharedDeck, SnapShot


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
