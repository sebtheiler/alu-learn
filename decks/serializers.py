from profiles.serializers import MinifiedProfileSerializer
from rest_framework import serializers
from skill_tree.serializers import MainSectionSerializer

from .models import Deck, FlashCard, ReviewInstance


class FlashCardSerializer(serializers.ModelSerializer):
    # parent_deck_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FlashCard
        fields = [
            'fields',
            'tags',
            'flashcard_type',
            'flashcard_num',
            # 'parent_deck_id',
            'front_image',
            'back_image',
            'id',
        ]

    # def get_parent_deck_id(self, obj):
        # return obj.sub_section.main_section.deck.id


class ReviewInstanceSerializer(serializers.ModelSerializer):
    flashcard_fields = serializers.SerializerMethodField(read_only=True)
    flashcard_front_image = serializers.SerializerMethodField(read_only=True)
    flashcard_back_image = serializers.SerializerMethodField(read_only=True)

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
            'flashcard_fields',
            'flashcard_front_image',
            'flashcard_back_image',
            'id',
        ]

    def get_flashcard_fields(self, obj):
        # If getting a queryset, remember to use .prefetch_related('flashcard')
        get_fields = self.context.get('get_flashcard_fields')
        if get_fields:
            return obj.flashcard.fields

    def get_flashcard_front_image(self, obj):
        get_fields = self.context.get('get_flashcard_fields')
        if get_fields:
            return str(obj.flashcard.front_image) or None

    def get_flashcard_back_image(self, obj):
        get_fields = self.context.get('get_flashcard_fields')
        if get_fields:
            return str(obj.flashcard.back_image) or None


class DeckSerializer(serializers.ModelSerializer):
    user = MinifiedProfileSerializer('user')
    main_sections = MainSectionSerializer('main_sections', many=True)

    class Meta:
        model = Deck
        fields = [
            'user',
            'title',
            'main_sections',
            'id',
        ]
