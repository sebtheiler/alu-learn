from profiles.serializers import (MinifiedProfileSerializer,
                                  PublicProfileSerializer)
from rest_framework import serializers

from .models import (CustomStudySessionManager, Deck, FlashCard,
                     ReviewInstance, SharedDeck, StudySessionManager)


class FlashCardSerializer(serializers.ModelSerializer):
    parent_deck_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCard
        fields = [
            'fields',
            'tags',
            'flashcard_type',
            'flashcard_num',
            'parent_deck_id',
            'id',
        ]

    def get_parent_deck_id(self, obj):
        return obj.deck.id


class ReviewInstanceSerializer(serializers.ModelSerializer):
    parent_deck_id = serializers.SerializerMethodField(read_only=True)
    parent_deck_title = serializers.SerializerMethodField(read_only=True)
    tags = serializers.SerializerMethodField(read_only=True)
    is_leech = serializers.SerializerMethodField(read_only=True)
    flashcard_type = serializers.SerializerMethodField(read_only=True)
    flashcard_id = serializers.SerializerMethodField(read_only=True)
    flashcard_num = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ReviewInstance
        fields = [
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
            'flashcard_id',
            'flashcard_type',
            'name',
            'flashcard_num',
            'id',
        ]

    def get_parent_deck_id(self, obj):
        return obj.flashcard.deck.id

    def get_parent_deck_title(self, obj):
        return obj.flashcard.deck.title

    def get_is_leech(self, obj):
        return obj.is_leech()

    def get_tags(self, obj):
        return obj.flashcard.tags

    def get_flashcard_type(self, obj):
        return obj.flashcard.flashcard_type

    def get_flashcard_id(self, obj):
        return obj.flashcard.id

    def get_flashcard_num(self, obj):
        return obj.flashcard.flashcard_num


class DeckSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField(read_only=True)
    scheduling_algorithm = serializers.SerializerMethodField(read_only=True)
    shuffle_unseen_cards = serializers.SerializerMethodField(read_only=True)
    new_cards_done_today = serializers.SerializerMethodField(read_only=True)
    daily_new_card_limit = serializers.SerializerMethodField(read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)
    review_ahead_minutes = serializers.SerializerMethodField(read_only=True)
    difficulty = serializers.SerializerMethodField(read_only=True)
    daily_seen_card_limit = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Deck
        fields = [
            'author',
            'title',
            'serializer_name',
            'scheduling_algorithm',
            'shuffle_unseen_cards',
            'new_cards_done_today',
            'daily_new_card_limit',
            'daily_seen_card_limit',
            'review_ahead_minutes',
            'shared_deck',
            'deck_type',
            'difficulty',
            'skill_tree',
            'id',
        ]

    def get_author(self, obj):
        request = self.context.get('request')
        if request and request.GET.get('fullDetail') == 'true':
            return PublicProfileSerializer(obj.user.profile).data
        else:
            return MinifiedProfileSerializer(obj.user.profile).data

    def get_scheduling_algorithm(self, obj):
        return obj.study_session_manager.scheduling_algorithm

    def get_shuffle_unseen_cards(self, obj):
        return obj.study_session_manager.shuffle_unseen_cards

    def get_new_cards_done_today(self, obj):
        return obj.study_session_manager.new_cards_done_today

    def get_daily_new_card_limit(self, obj):
        return obj.study_session_manager.daily_new_card_limit

    def get_daily_seen_card_limit(self, obj):
        return obj.study_session_manager.daily_seen_card_limit

    def get_serializer_name(self, obj):
        return 'deck'

    def get_review_ahead_minutes(self, obj):
        return obj.study_session_manager.review_ahead_minutes

    def get_difficulty(self, obj):
        return obj.study_session_manager.difficulty


class SharedDeckSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField(read_only=True)
    num_clones = serializers.SerializerMethodField(read_only=True)
    serializer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SharedDeck
        fields = [
            'author',
            'title',
            'description',
            'sharing_setting',
            'num_clones',
            'serializer_name',
            'deck_type',
            'creators',
            'id',
        ]

    def get_author(self, obj):
        request = self.context.get('request')
        if request and request.GET.get('fullDetail') == 'true':
            return PublicProfileSerializer(obj.user.profile).data
        else:
            return MinifiedProfileSerializer(obj.user.profile).data

    def get_num_clones(self, obj):
        return obj.clones.count()

    def get_serializer_name(self, obj):
        return 'shared_deck'


class StudySessionManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySessionManager
        fields = [
            'scheduling_algorithm',
            'shuffle_unseen_cards',
            'daily_new_card_limit',
            'daily_seen_card_limit',
            'new_cards_done_today',
            'review_ahead_minutes',
            'difficulty',
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
        read_only_fields = fields  # TODO: add `read_only_fields = fields` everywhere

    def get_serializer_name(self, obj):
        return 'cssm'
