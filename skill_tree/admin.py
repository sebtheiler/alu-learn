from django.contrib import admin

from .models import MainSection, SubSection


class SubSectionInline(admin.TabularInline):
    model = SubSection


class MainSectionAdmin(admin.ModelAdmin):
    model = MainSection

    inlines = (SubSectionInline,)
    list_display = (
        'title',
        'get_user',
        'get_decks',
        'get_shared_decks',
    )
    search_fields = (
        'title',
        'deck__title',
        'deck__user__username',
    )

    def get_queryset(self, request):
        queryset = super(MainSectionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('decks__user', 'shared_decks')
        return queryset

    def get_user(self, obj):
        return obj.decks.first().user if obj.decks.first() else None
    get_user.short_description = 'User'

    def get_decks(self, obj):
        return ', '.join([deck.title for deck in obj.decks])
    get_decks.short_description = 'Decks'

    def get_shared_decks(self, obj):
        return ', '.join([shared_deck.title for shared_deck in obj.shared_decks])
    get_shared_decks.short_description = 'Shared Decks'


admin.site.register(MainSection, MainSectionAdmin)
