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
            'is_leech',
            'leech_index',
            'interval',
            'steps_index',
        ), 'classes': ('collapse',)})
    ]
    class Meta:
        model = FlashCard


class DeckAdmin(admin.ModelAdmin):
    inlines = [FlashCardTabAdmin]
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    class Meta:
        model = Deck

admin.site.register(Deck, DeckAdmin)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(DeckThank)