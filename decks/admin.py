from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, DeckThank, DeckStudySessionManager, CustomStudySessionManager, FlashCardField, FlashCardCreator, SharedDeck, SharedDeckRelation, DeckClone

class FlashCardFieldTabAdmin(admin.TabularInline):
    fields = [
        'text',
        'field_number',
    ]
    model = FlashCardField


class FlashCardFieldAdmin(admin.ModelAdmin):
    search_fields = ['text']
    ordering = ['-id']
    model = FlashCardField


class FlashCardCreatorAdmin(admin.ModelAdmin):
    search_fields = ['tags']
    ordering = ['-id']
    fields = [
        'deck',
        'tags',
        'flashcard_type',
        'flashcard_num',
    ]
    inlines = [FlashCardFieldTabAdmin]
    model = FlashCardCreator


class FlashCardAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'creator']
    search_fields = ['creator__deck__title']
    
    class Meta:
        model = FlashCard


class DeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    fields = [
        'user',
        'title',
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
admin.site.register(FlashCardCreator, FlashCardCreatorAdmin)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(FlashCardField, FlashCardFieldAdmin)
admin.site.register(DeckThank)
admin.site.register(DeckClone)
admin.site.register(DeckStudySessionManager)
admin.site.register(CustomStudySessionManager)