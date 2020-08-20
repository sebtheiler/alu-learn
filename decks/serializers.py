from django.conf import settings
from rest_framework import serializers
from profiles.serializers import PublicProfileSerializer
from .models import Deck, FlashCard


class FlashCardSerializer(serializers.ModelSerializer):
    parent_deck_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCard
        fields = [
            'front_text',
            'back_text',
            'tags',
            'next_review',
            'graduated',
            'ease',
            'interval',
            'is_suspended',
            'is_leech',
            'parent_deck_id',
            'id',
        ]
    
    def get_parent_deck_id(self, obj):
        return obj.deck.id


class DeckSerializer(serializers.ModelSerializer):
    author = PublicProfileSerializer(source='user.profile', read_only=True)
    flashcards = FlashCardSerializer(read_only=True, many=True)
    class Meta:
        model = Deck
        fields = [
            'author',
            'title',
            'description',
            'flashcards',
            'sharing_setting',
            'id',
        ]
    
    def validate_title(self, value):
        if len(value) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
        return value
