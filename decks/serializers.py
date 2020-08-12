from django.conf import settings
from rest_framework import serializers
from profiles.serializers import PublicProfileSerializer
from .models import Deck, FlashCard, Tag


class FlashCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashCard
        fields = [
            'front_text',
            'back_text',
            'next_review',
            'graduated',
            'ease',
            'interval',
            'id',
        ]


class DeckSerializer(serializers.ModelSerializer):
    author = PublicProfileSerializer(source='user.profile', read_only=True)
    flashcards = FlashCardSerializer(read_only=True, many=True)
    class Meta:
        model = Deck
        fields = [
            'author',
            'title',
            'flashcards',
            'id',
        ]
    
    def validate_title(self, value):
        if len(value) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
        return value
