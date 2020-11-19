from django.db import models
from django.contrib.postgres.fields import JSONField
from profiles.models import Profile


class Note(models.Model):
    title = models.CharField(max_length=128)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notes')

    def __str__(self) -> str:
        return self.title


class NotePage(models.Model):
    title = models.CharField(max_length=128)
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='pages', null=True)
    page_number = models.PositiveSmallIntegerField()

    def __str__(self) -> str:
        return self.title


class FreeformNotePage(NotePage):
    content = JSONField()


class CornellNotePage(NotePage):
    summary = JSONField()


class CornellNotePageSection(models.Model):
    parent_note = models.ForeignKey(CornellNotePage, on_delete=models.CASCADE, related_name='sections')
    cue = JSONField()
    content = JSONField()
    section_number = models.PositiveSmallIntegerField() # counts from 0

    class Meta:
        ordering = ['section_number']