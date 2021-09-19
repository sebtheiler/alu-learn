from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import (FlashCardAction, MainSectionAction, SharedDeck, SnapShot,
                     SubmittedChanges, SubSectionAction)


class FlashCardActionInline(admin.TabularInline):
    model = FlashCardAction


class FlashCardActionAdmin(admin.ModelAdmin):
    model = FlashCardAction
    list_display = (
        'deck',
        'snapshot',
        'link_to_flashcard',
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

    def link_to_flashcard(self, obj):
        link = reverse('admin:decks_flashcard_change', args=[obj.flashcard_id])
        return format_html('<a href="{}">{}</a>', link, str(obj.flashcard))
    link_to_flashcard.short_description = 'Flashcard'


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
        'author__user__username',
    )

    def get_queryset(self, request):
        queryset = super(SnapShotAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('shared_deck', 'parent', 'author')
        return queryset


class SnapShotInline(admin.TabularInline):
    model = SnapShot


class SubmittedChangesAdmin(admin.ModelAdmin):
    model = SubmittedChanges

    # inlines = (FlashCardActionInline, MainSectionActionInline, SubSectionActionInline)
    list_display = (
        'shared_deck',
        'message',
        'author',
        'timestamp',
    )

    search_fields = (
        'message',
        'shared_deck__title',
        'author__user__username',
    )

    def get_queryset(self, request):
        queryset = super(SubmittedChangesAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related(
            'shared_deck',
            'author',
        )
        return queryset


class SubmittedChangesInline(admin.TabularInline):
    model = SubmittedChanges


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
admin.site.register(SubmittedChanges, SubmittedChangesAdmin)
admin.site.register(SharedDeck, SharedDeckAdmin)
admin.site.register(FlashCardAction, FlashCardActionAdmin)
admin.site.register(MainSectionAction, MainSectionActionAdmin)
admin.site.register(SubSectionAction, SubSectionActionAdmin)
