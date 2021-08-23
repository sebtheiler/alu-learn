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
        'deck',
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


admin.site.register(MainSection, MainSectionAdmin)
