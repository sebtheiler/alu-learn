from django.contrib import admin

from .models import FlashCardAction, SharedDeck, SnapShot


class FlashCardActionInline(admin.TabularInline):
    model = FlashCardAction


class SnapShotAdmin(admin.ModelAdmin):
    model = SnapShot

    inlines = (FlashCardActionInline,)
    list_display = (
        'shared_deck',
        'message',
        'parent',
        'timestamp',
    )
    search_fields = (
        'message',
        'shared_deck__title',
        'shared_deck__owners',
    )

    def get_queryset(self, request):
        queryset = super(SnapShotAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('shared_deck', 'parent')
        return queryset

    def get_owners(self, obj):
        return obj.shared_deck.owners
    get_owners.short_description = 'Owners'


class SnapShotInline(admin.TabularInline):
    model = SnapShot


class SharedDeckAdmin(admin.ModelAdmin):
    model = SharedDeck

    inlines = (SnapShotInline,)
    list_display = (
        'title',
        'description',
        'owners',
    )
    search_fields = (
        'title',
        'description',
        'owners',
    )


admin.site.register(SnapShot, SnapShotAdmin)
admin.site.register(SharedDeck, SharedDeckAdmin)
