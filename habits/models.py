from django.db import models
from profiles.models import Profile


class Routine(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)
    ordered = models.BooleanField(default=True)


class Habit(models.Model):
    title = models.CharField(max_length=64)
    cue = models.CharField(max_length=128, blank=True)
    craving = models.CharField(max_length=128, blank=True)
    response = models.CharField(max_length=128, blank=True)
    reward = models.CharField(max_length=128, blank=True)

    VALUE_CHOICES = [
        ('POSITIVE', 'Positive'),
        ('NEGATIVE', 'Negative'),
        ('NEUTRAL', 'Neutral'),
    ]
    value = models.CharField(max_length=10, choices=VALUE_CHOICES)

    routine = models.ForeignKey(
        Routine,
        on_delete=models.CASCADE,
        related_name='habits',
    )
