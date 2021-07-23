from django.contrib import admin

# Register your models here.
from .models import (CustomStudySessionManager, Deck, DeckClone,
                     DeckStudySessionManager, FlashCard, ReviewInstance,
                     SharedDeck, SharedDeckRelation)


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
admin.site.register(DeckClone)
admin.site.register(DeckStudySessionManager)
admin.site.register(CustomStudySessionManager)
