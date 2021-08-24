from django.contrib import admin

from .models import MainSection, SubSection
from sharing_system.models import SharedDeck


class SubSectionInline(admin.TabularInline):
    model = SubSection


class MainSectionAdmin(admin.ModelAdmin):
    model = MainSection

    inlines = (SubSectionInline,)
    list_display = (
        'title',
        'get_user',
        'deck',
        'get_shared_deck',
    )
    search_fields = (
        'title',
        'deck__title',
        'deck__user__username',
    )

    def get_queryset(self, request):
        queryset = super(MainSectionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('deck__user')
        return queryset

    def get_user(self, obj):
        return obj.deck.user if obj.deck else None
    get_user.short_description = 'User'

    def get_shared_deck(self, obj):
        return SharedDeck.objects.filter(snapshots__main_sections=obj).first()
    get_shared_deck.short_description = 'Shared Deck'


admin.site.register(MainSection, MainSectionAdmin)
