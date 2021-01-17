from django.contrib.postgres.fields import JSONField
from django.db import models
from profiles.models import Profile
import datetime as dt

class ManualSRTask(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='manual_sr_objects')
    title = models.CharField(max_length=128)
    description = JSONField()


    LEARNING_STATUS_CHOICES = [
        ('UNSEEN', 'Unseen/New'),
        ('LEARNING', 'Learning'),
        ('LEARNED', 'Learned'),
        ('RELEARNING', 'Relearning'),
    ]

    learning_status = models.CharField(max_length=10, choices=LEARNING_STATUS_CHOICES, default='UNSEEN')
    steps_index = models.PositiveSmallIntegerField(default=0)
    ease = models.PositiveSmallIntegerField(default=250)
    next_review = models.DateField(default=dt.date.today)
    interval = models.PositiveSmallIntegerField(default=0) # in days

    def __str__(self) -> str:
        return f'Task "{self.title}" for @{self.user.user.username}'
