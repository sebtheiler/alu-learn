from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, DeckThank

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
    fieldsets = [
        (None, {'fields': (
            'front_text',
            'back_text',
            'tags',
            'next_review',
        )}),
        ('Advanced options', {'fields': (
            'learning_status',
            'ease',
            'is_suspended',
            'leech_index',
            'interval',
            'steps_index',
        ), 'classes': ('collapse',)})
    ]
    class Meta:
        model = FlashCard


class DeckAdmin(admin.ModelAdmin):
    # TODO: cleanup
    # inlines = [FlashCardTabAdmin]
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    # fieldsets = [
    #     (None, {'fields': (
    #         'title',
    #         'description',
    #         'shuffle_unseen_cards',
    #         'sharing_setting',
    #         'scheduling_algorithm',
    #         'new_cards_done_today',
    #     )}),
    #     ('Flashcards', {'fields': (
    #         'flashcards',
    #     ), 'classes': ('collapse',)})
    # ]
    class Meta:
        model = Deck
    
    # def get_flashcards(self, obj):
    #     return obj.flashcards

admin.site.register(Deck, DeckAdmin)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(DeckThank)