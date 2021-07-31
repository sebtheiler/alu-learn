from profiles.serializers import MinifiedProfileSerializer
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
    flashcard_fields = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ReviewInstance
        fields = [
            'next_review',
            'steps_index',
            'learning_status',
            'ease',
            'interval',
            'is_suspended',
            'leech_index',
            'name',
            'flashcard_fields',
            'id',
        ]

    def get_flashcard_fields(self, obj):
        # If getting a queryset, remember to use .prefetch_related('flashcard')
        get_fields = self.context.get('get_flashcard_fields')
        if not get_fields:
            return None

        return obj.flashcard.fields


class DeckSerializer(serializers.ModelSerializer):
    user = MinifiedProfileSerializer('user')

    class Meta:
        model = Deck
        fields = [
            'user',
            'title',
            'shared_deck',
            'deck_type',
            'skill_tree',
            'id',
        ]


class SharedDeckSerializer(serializers.ModelSerializer):
    user = MinifiedProfileSerializer('user')
    num_clones = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SharedDeck
        fields = DeckSerializer.Meta.fields + [
            'description',
            'sharing_setting',
            'num_clones',
            'deck_type',
            'creators',
        ]

    def get_num_clones(self, obj):
        return obj.clones.count()


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
