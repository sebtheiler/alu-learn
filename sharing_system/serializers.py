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
            'parent',  # just the ID
            'main_sections',
            'id',
        )


class SharedDeckSerializer(serializers.ModelSerializer):
    owners = MinifiedProfileSerializer('owners', many=True)
    snapshots = SnapShotSerializer('snapshots', many=True)

    class Meta:
        model = SharedDeck
        fields = (
            'title',
            'description',
            'view_access',
            'edit_access',
            'owners',
            'snapshots',
            'id',
        )
