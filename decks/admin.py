from django.contrib import admin

# Register your models here.
from .models import (CustomStudySessionManager, Deck, DeckClone,
                     DeckStudySessionManager, FlashCard, ReviewInstance,
                     ReviewInstanceHistory, SharedDeck, SharedDeckRelation)


class FlashCardAdmin(admin.ModelAdmin):
    search_fields = ['tags']
    fields = [
        'deck',
        'flashcard_type',
        'flashcard_num',
        'fields',
        'tags',
    ]
    model = FlashCard


class ReviewInstanceAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'flashcard']
    search_fields = ['flashcard__deck__title']

    class Meta:
        model = ReviewInstance


class ReviewInstanceHistoryAdmin(admin.ModelAdmin):
    model = ReviewInstanceHistory
    list_display = (
        'get_user',
        'get_deck',
        'grade_response',
        'time_taken',
        'next_review',
        'last_review',
        'timestamp',
    )
    list_filter = ('timestamp',)
    ordering = ('-timestamp',)

    def get_queryset(self, request):
        queryset = super(ReviewInstanceHistoryAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('review_instance__flashcard__deck__user')
        return queryset

    def get_user(self, obj):
        return self.get_deck(obj).user
    get_user.short_description = 'User'

    def get_deck(self, obj):
        return obj.review_instance.flashcard.deck
    get_deck.short_description = 'Deck'


class DeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    fields = [
        'user',
        'title',
        'student_attached_to',
        'shared_deck',
    ]

    class Meta:
        model = Deck


class SharedDeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    exclude = ['inherits_flashcards_from', 'shared_deck']

    class Meta:
        model = SharedDeck


admin.site.register(Deck, DeckAdmin)
admin.site.register(SharedDeck, SharedDeckAdmin)
admin.site.register(SharedDeckRelation)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(ReviewInstance, ReviewInstanceAdmin)
admin.site.register(ReviewInstanceHistory, ReviewInstanceHistoryAdmin)
admin.site.register(DeckClone)
admin.site.register(DeckStudySessionManager)
admin.site.register(CustomStudySessionManager)
