from django.db import models
from django.contrib.postgres.fields import JSONField
from profiles.models import Profile

class Note(models.Model):
    title = models.CharField(max_length=128)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notes')


class FreeformNote(Note):
    content = JSONField()