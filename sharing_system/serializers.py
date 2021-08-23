from rest_framework import serializers

from .models import SharedDeck


class SharedDeckSerializer(serializers.ModelSerializer):
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
