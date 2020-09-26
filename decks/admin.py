from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, DeckThank, DeckStudySessionManager, CustomStudySessionManager, FlashCardField, FlashCardCreator

class FlashCardFieldAdmin(admin.TabularInline):
    fields = [
        'text',
        'field_number',
    ]
    model = FlashCardField


class FlashCardCreatorAdmin(admin.ModelAdmin):
    fields = [
        'deck',
        'tags',
        'flashcard_type',
    ]
    inlines = [FlashCardFieldAdmin]
    model = FlashCardCreator


class FlashCardTabAdmin(admin.TabularInline):
    fields = [
        'front_text',
        'back_text',
        'tags',
        'next_review',
    ]
    model = FlashCard


class FlashCardAdmin(admin.ModelAdmin):
    search_fields = ['front_text', 'back_text', 'deck__title']
    
    class Meta:
        model = FlashCard


class DeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']

    class Meta:
        model = Deck

admin.site.register(Deck, DeckAdmin)
admin.site.register(FlashCardCreator, FlashCardCreatorAdmin)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(DeckThank)
admin.site.register(DeckStudySessionManager)
admin.site.register(CustomStudySessionManager)