from django.contrib import admin

from .models import (FlashCardAction, MainSectionAction, SharedDeck, SnapShot,
                     SubSectionAction)


class FlashCardActionInline(admin.TabularInline):
    model = FlashCardAction


class FlashCardActionAdmin(admin.ModelAdmin):
    model = FlashCardAction
    list_display = (
        'deck',
        'snapshot',
        'flashcard',
        'action',
    )
    search_fields = (
        'deck__title',
        'snapshot__message',
        'snapshot__shared_deck__title',
    )

    def get_queryset(self, request):
        queryset = super(FlashCardActionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('deck', 'snapshot', 'flashcard')
        return queryset


class MainSectionActionAdmin(admin.ModelAdmin):
    model = MainSectionAction
    list_display = (
        'deck',
        'snapshot',
        'main_section',
        'action',
    )
    search_fields = (
        'deck__title',
        'snapshot__message',
        'snapshot__shared_deck__title',
    )

    def get_queryset(self, request):
        queryset = super(MainSectionActionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('deck', 'snapshot', 'main_section')
        return queryset


class SubSectionActionAdmin(admin.ModelAdmin):
    model = MainSectionAction
    list_display = (
        'deck',
        'snapshot',
        'sub_section',
        'action',
    )
    search_fields = (
        'deck__title',
        'snapshot__message',
        'snapshot__shared_deck__title',
    )

    def get_queryset(self, request):
        queryset = super(SubSectionActionAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('deck', 'snapshot', 'sub_section')
        return queryset


class MainSectionActionInline(admin.TabularInline):
    model = MainSectionAction


class SubSectionActionInline(admin.TabularInline):
    model = SubSectionAction


class SnapShotAdmin(admin.ModelAdmin):
    model = SnapShot

    inlines = (FlashCardActionInline, MainSectionActionInline, SubSectionActionInline)
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
        'formatted_owners',
    )
    search_fields = (
        'title',
        'description',
        'owners',
    )

    def get_queryset(self, request):
        queryset = super(SharedDeckAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('owners__user')
        return queryset

    def formatted_owners(self, obj):
        return ','.join([owner.user.username for owner in obj.owners.all()])


admin.site.register(SnapShot, SnapShotAdmin)
admin.site.register(SharedDeck, SharedDeckAdmin)
admin.site.register(FlashCardAction, FlashCardActionAdmin)
admin.site.register(MainSectionAction, MainSectionActionAdmin)
admin.site.register(SubSectionAction, SubSectionActionAdmin)
