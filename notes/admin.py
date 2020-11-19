from django.contrib import admin
from .models import FreeformNotePage, CornellNotePage, CornellNotePageSection, Note


class CornellNoteSectionAdmin(admin.TabularInline):
    fields = [
        'cue',
        'content',
        'section_number',
    ]
    model = CornellNotePageSection


class CornellNoteAdmin(admin.ModelAdmin):
    fields = [
        'title',
        'user',
        'summary',
    ]
    inlines = [CornellNoteSectionAdmin]
    model = CornellNotePage


admin.site.register(Note)
admin.site.register(FreeformNotePage)
admin.site.register(CornellNotePage, CornellNoteAdmin)