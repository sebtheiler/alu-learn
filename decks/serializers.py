from django.conf import settings
from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from .models import Deck, FlashCard, DeckThank, StudySessionManager, CustomStudySessionManager


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
    parent_deck_title = serializers.SerializerMethodField(read_only=True)
    is_leech = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCard
        fields = [
            'front_text',
            'back_text',
            'tags',
            'next_review',
            'steps_index',
            'learning_status',
            'ease',
            'interval',
            'is_suspended',
            'is_leech',
            'leech_index',
            'parent_deck_id',
            'parent_deck_title',
            'id',
        ]
    
    def get_parent_deck_id(self, obj):
        return obj.deck.id
    
    def get_parent_deck_title(self, obj):
        return obj.deck.title
    
    def get_is_leech(self, obj):
        return obj.is_leech()


class DeckSerializer(serializers.ModelSerializer):
    author = MinifiedProfileSerializer(source='user.profile', read_only=True)
    num_thanks = serializers.SerializerMethodField(read_only=True)
    you_have_thanked = serializers.SerializerMethodField(read_only=True)
    scheduling_algorithm = serializers.SerializerMethodField(read_only=True)
    shuffle_unseen_cards = serializers.SerializerMethodField(read_only=True)
    new_cards_done_today = serializers.SerializerMethodField(read_only=True)
    daily_new_card_limit = serializers.SerializerMethodField(read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Deck
        fields = [
            'author',
            'title',
            'description',
            'sharing_setting',
            'num_thanks',
            'you_have_thanked',
            'serializer_name',
            'id',
            # ssm
            'scheduling_algorithm',
            'shuffle_unseen_cards',
            'new_cards_done_today',
            'daily_new_card_limit',
        ]
    
    def validate_title(self, value):
        if len(value) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
        return value

    def get_you_have_thanked(self, obj):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return None
        if request.user.is_anonymous:
            return False

        thank_profiles_list = [thank.profile for thank in obj.thanks.all()]
        has_thanked = request.user.profile in thank_profiles_list
        return has_thanked

    def get_num_thanks(self, obj):
        return obj.thanks.count()
    
    def get_scheduling_algorithm(self, obj):
        return obj.study_session_manager.scheduling_algorithm
    
    def get_shuffle_unseen_cards(self, obj):
        return obj.study_session_manager.shuffle_unseen_cards
    
    def get_new_cards_done_today(self, obj):
        return obj.study_session_manager.new_cards_done_today
    
    def get_daily_new_card_limit(self, obj):
        return obj.study_session_manager.daily_new_card_limit
    
    def get_serializer_name(self, obj):
        return 'deck'


class StudySessionManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySessionManager
        fields = [
            'scheduling_algorithm',
            'shuffle_unseen_cards',
            'daily_new_card_limit',
            'new_cards_done_today',
            'review_ahead_minutes',
            'id',
        ]


class CustomStudySessionManagerSerializer(StudySessionManagerSerializer):
    author = MinifiedProfileSerializer(source='user', read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomStudySessionManager
        fields = StudySessionManagerSerializer.Meta.fields + [
            'author',
            'title',
            'serializer_name',
            'deck_ids',
            'tags',
            'contains',
            'leech',
            'learning_status',
            'min_ease',
            'max_ease',
        ]

    def get_serializer_name(self, obj):
        return 'cssm'