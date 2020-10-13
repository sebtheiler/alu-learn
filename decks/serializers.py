from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer, PublicProfileSerializer
from .models import Deck, FlashCard, DeckThank, StudySessionManager, CustomStudySessionManager, FlashCardField, FlashCardCreator


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


class FlashCardFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashCardField
        fields = [
            'text',
            'field_number',
            'id',
        ]


class FlashCardCreatorSerializer(serializers.ModelSerializer):
    deck_fields = FlashCardFieldSerializer(source='fields', many=True, read_only=True)
    parent_deck_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCardCreator
        fields = [
            'deck_fields',
            'flashcard_type',
            'tags',
            'parent_deck_id',
            'id',
        ]
    
    def get_parent_deck_id(self, obj):
        return obj.deck.id


class FlashCardSerializer(serializers.ModelSerializer):
    deck_fields = serializers.SerializerMethodField(read_only=True)
    parent_deck_id = serializers.SerializerMethodField(read_only=True)
    parent_deck_title = serializers.SerializerMethodField(read_only=True)
    tags = serializers.SerializerMethodField(read_only=True)
    is_leech = serializers.SerializerMethodField(read_only=True)
    flashcard_type = serializers.SerializerMethodField(read_only=True)
    creator_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCard
        fields = [
            'deck_fields',
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
            'creator_id',
            'flashcard_type',
            'name',
            'id',
        ]
    
    def get_parent_deck_id(self, obj):
        return obj.creator.deck.id
    
    def get_parent_deck_title(self, obj):
        return obj.creator.deck.title
    
    def get_is_leech(self, obj):
        return obj.is_leech()
    
    def get_tags(self, obj):
        return obj.creator.tags
    
    def get_deck_fields(self, obj):
        return FlashCardFieldSerializer(obj.get_content(), many=True).data
    
    def get_flashcard_type(self, obj):
        return obj.creator.flashcard_type
    
    def get_creator_id(self, obj):
        return obj.creator.id


class DeckSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField(read_only=True)
    num_thanks = serializers.SerializerMethodField(read_only=True)
    you_have_thanked = serializers.SerializerMethodField(read_only=True)
    scheduling_algorithm = serializers.SerializerMethodField(read_only=True)
    shuffle_unseen_cards = serializers.SerializerMethodField(read_only=True)
    new_cards_done_today = serializers.SerializerMethodField(read_only=True)
    daily_new_card_limit = serializers.SerializerMethodField(read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)
    review_ahead_minutes = serializers.SerializerMethodField(read_only=True)

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
            'scheduling_algorithm',
            'shuffle_unseen_cards',
            'new_cards_done_today',
            'daily_new_card_limit',
            'review_ahead_minutes',
            'id',
        ]

    def get_author(self, obj):
        request = self.context.get('request')
        if request and request.GET.get('fullDetail') == 'true':
            return PublicProfileSerializer(obj.user.profile).data
        else:
            return MinifiedProfileSerializer(obj.user.profile).data

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
    
    def get_review_ahead_minutes(self, obj):
        return obj.study_session_manager.review_ahead_minutes


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