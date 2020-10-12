from django.contrib.postgres.fields import JSONField
from django.db import models


class ManualSRObject(models.Model):
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
    next_review = models.DateTimeField()
    interval = models.PositiveSmallIntegerField(default=0) # in days
