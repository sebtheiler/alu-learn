from django.db import models
from decks.models import SharedDeck
from profiles.models import Profile


class Classroom(models.Model):
    title = models.CharField(max_length=128)
    code = models.CharField(max_length=8)
    teachers = models.ManyToManyField(Profile, related_name='classrooms_taught')
    students = models.ManyToManyField(Profile, related_name='classrooms_in', blank=True)
    deck = models.ForeignKey(SharedDeck, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self) -> str:
        return self.title
