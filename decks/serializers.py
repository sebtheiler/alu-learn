from profiles.serializers import MinifiedProfileSerializer
from rest_framework import serializers
from sharing_system.models import FlashCardAction
from skill_tree.serializers import (AbstractActionSerializer,
                                    MainSectionSerializer)

from .models import Deck, FlashCard, FlashCardData, ReviewInstance


class FlashCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashCardData
        fields = (
            'fields',
            'tags',
            'front_image',
            'back_image',
            'id',
        )


class FlashCardSerializer(serializers.ModelSerializer):
    data = FlashCardDataSerializer('data')

    class Meta:
        model = FlashCard
        fields = [
            'flashcard_type',
            'order_num',
            'data',
            'id',
        ]


class FlashcardActionSerializer(AbstractActionSerializer):
    flashcard = FlashCardSerializer('flashcard')

    class Meta:
        model = FlashCardAction
        fields = AbstractActionSerializer.Meta.fields + (
            'flashcard',
            'universal_flashcard_id',
        )


class ReviewInstanceSerializer(serializers.ModelSerializer):
    data = FlashCardDataSerializer('flashcard__data')

    class Meta:
        model = ReviewInstance
        fields = [
            'next_review',
            'last_review',
            'steps_index',
            'learning_status',
            'ease',
            'is_suspended',
            'leech_index',
            'name',
            'id',
        ]


class DeckSerializer(serializers.ModelSerializer):
    user = MinifiedProfileSerializer('user')
    main_sections = MainSectionSerializer('main_sections', many=True)

    class Meta:
        model = Deck
        fields = [
            'user',
            'title',
            'main_sections',
            'equivalent_to_snapshot',
            'is_updated',
            'id',
        ]
