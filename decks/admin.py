from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard

class FlashCardAdmin(admin.TabularInline):
    model = FlashCard


class DeckAdmin(admin.ModelAdmin):
    inlines = [FlashCardAdmin]
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    class Meta:
        model = Deck

admin.site.register(Deck, DeckAdmin)
admin.site.register(FlashCard)