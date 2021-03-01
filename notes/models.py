from django.db import models
from profiles.models import Profile


class Note(models.Model):
    title = models.CharField(max_length=128)  # type: str
    user = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='notes',
    )  # type: Profile

    def __str__(self) -> str:
        return self.title


class NotePage(models.Model):
    title = models.CharField(max_length=128)  # type: str
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='pages',
        null=True,
    )  # type: Note

    # Page num is 1-indexed
    page_number = models.PositiveSmallIntegerField()  # type: int

    def __str__(self) -> str:
        return self.title


class FreeformNotePage(NotePage):
    content = models.JSONField()


class CornellNotePage(NotePage):
    summary = models.JSONField()


class CornellNotePageSection(models.Model):
    parent_note = models.ForeignKey(
        CornellNotePage,
        on_delete=models.CASCADE,
        related_name='sections',
    )  # type: CornellNotePage
    cue = models.JSONField()
    content = models.JSONField()
    section_number = models.PositiveSmallIntegerField()  #  type: int # 0-indexed

    class Meta:
        ordering = ['section_number']
