from django.conf import settings
from rest_framework import serializers

from .models import Deck, FlashCard, Tag


class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ['title', 'id']
    
    def validate_title(self, value):
        if len(value) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
        return value
