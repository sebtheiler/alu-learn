from django.contrib import admin

# Register your models here.
from .models import Deck

class DeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    class Meta:
        model = Deck

admin.site.register(Deck, DeckAdmin)