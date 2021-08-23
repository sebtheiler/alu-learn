from rest_framework import serializers

from .models import SharedDeck
from profiles.serializers import MinifiedProfileSerializer


class SharedDeckSerializer(serializers.ModelSerializer):
    owners = MinifiedProfileSerializer('owners', many=True)

    class Meta:
        model = SharedDeck
        fields = (
            'title',
            'description',
            'view_access',
            'edit_access',
            'owners',
            'id',
        )
