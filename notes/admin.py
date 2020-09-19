from django.contrib import admin
from .models import FreeformNote, CornellNote, CornellNoteSection


class CornellNoteSectionAdmin(admin.TabularInline):
    fields = [
        'cue',
        'content',
        'section_number',
    ]
    model = CornellNoteSection


class CornellNoteAdmin(admin.ModelAdmin):
    fields = [
        'title',
        'user',
        'summary',
    ]
    inlines = [CornellNoteSectionAdmin]
    model = CornellNote

admin.site.register(FreeformNote)
admin.site.register(CornellNote, CornellNoteAdmin)