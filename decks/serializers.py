from django.conf import settings
from rest_framework import serializers
from profiles.serializers import PublicProfileSerializer
from .models import Deck, FlashCard, DeckThank


class DeckThankSerializer(serializers.ModelSerializer):
    deck_id = serializers.SerializerMethodField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DeckThank
        fields = [
            'deck_id',
            'username',
            'timestamp',
        ]
    
    def get_deck_id(self, obj):
        return obj.deck.id
    
    def get_username(self, obj):
        return obj.profile.user.username


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
    num_thanks = serializers.SerializerMethodField(read_only=True)
    you_have_thanked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Deck
        fields = [
            'author',
            'title',
            'description',
            'flashcards',
            'sharing_setting',
            'num_thanks',
            'you_have_thanked',
            'id',
        ]
    
    def validate_title(self, value):
        if len(value) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
        return value

    def get_you_have_thanked(self, obj):
        request = self.context.get('request')
        thank_profiles_list = [thank.profile for thank in obj.thanks.all()]
        has_thanked = request.user.profile in thank_profiles_list
        return has_thanked

    def get_num_thanks(self, obj):
        return obj.thanks.count()