import os

from django.db import models
from django.db.models.signals import post_delete


class ContactFeedback(models.Model):
    title = models.CharField(max_length=80)
    description = models.TextField(max_length=4000)
    error_code = models.CharField(max_length=8, null=True)
    contact_allowed = models.BooleanField(default=False)
    email_address = models.EmailField(max_length=64)
    urgency = models.PositiveSmallIntegerField(null=True)
    is_legal_issue = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-urgency',)

    def __str__(self) -> str:
        return ('(LEGAL): ' if self.is_legal_issue else 'Feedback: ') + self.title


class UploadedImage(models.Model):
    flashcard_data = models.ForeignKey(
        'decks.FlashCardData',
        on_delete=models.CASCADE,
        related_name='images',
        null=True, blank=True,
    )

    image = models.ImageField(upload_to='uploads/')
    description = models.CharField(max_length=512, null=True, blank=True, default='')
    original_url = models.URLField(null=True, blank=True)

    field_number = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('field_number',)

    def __str__(self) -> str:
        return self.image.name


# Deletes file from filesystem when corresponding `UploadedImage` object is deleted
# Adapted from https://stackoverflow.com/a/16041527/10226703
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if os.path.isfile(instance.image.path):
        os.remove(instance.image.path)


post_delete.connect(auto_delete_file_on_delete, sender=UploadedImage)
