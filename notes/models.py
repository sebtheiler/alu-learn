from django.db import models
from django.contrib.postgres.fields import JSONField
from profiles.models import Profile

class Note(models.Model):
    title = models.CharField(max_length=128)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notes')

    def __str__(self):
        return self.title


class FreeformNote(Note):
    content = JSONField()


class CornellNote(Note):
    summary = JSONField()


class CornellNoteSection(models.Model):
    parent_note = models.ForeignKey(CornellNote, on_delete=models.CASCADE, related_name='sections')
    cue = JSONField()
    content = JSONField()
    section_number = models.PositiveSmallIntegerField() # counts from 0
