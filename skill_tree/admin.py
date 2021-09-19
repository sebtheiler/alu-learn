from django.contrib import admin

from .models import MainSection, SubSection


class SubSectionInline(admin.TabularInline):
    model = SubSection


class MainSectionAdmin(admin.ModelAdmin):
    model = MainSection

    inlines = (SubSectionInline,)
    list_display = (
        'data_title',
        'get_user',
        # 'get_decks',
        'deck',
        'snapshot',
    )
    search_fields = (
        'data__title',
        'deck__title',
        'deck__user__username',
    )

    def get_queryset(self, request):
        queryset = super(MainSectionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('deck__user', 'snapshot')
        return queryset

    def data_title(self, obj):
        return obj.data.title

    def get_user(self, obj):
        return obj.deck.user if obj.deck else '<Multiple owners>'
    get_user.short_description = 'User'

    # def get_decks(self, obj):
    #     return ', '.join([deck.title for deck in obj.decks])
    # get_decks.short_description = 'Decks'


admin.site.register(MainSection, MainSectionAdmin)
