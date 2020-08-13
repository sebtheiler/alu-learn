from django.conf import settings
from django.db import models
from django.db.models import Q

# Create your models here.
User = settings.AUTH_USER_MODEL


class DeckQuerySet(models.QuerySet):
    # Get all decks owned by a username (case insensitive)
    def by_username(self, username):
        return self.filter(user__username__iexact=username)

    # Get the feed for a user
    def feed(self, user):
        # Order alphabetically, not by order added
        feed_qs = self.filter(user__username=user.username).order_by('title')

        # This will be used in the future, once sharing is created
        # feed_qs = self.filter(
        #     Q(user__username=user.username) | 
        #     Q(...) # if shared with current user
        # ).order_by('title')
        return feed_qs


class DeckManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return DeckQuerySet(self.model, using=self._db)

    def feed(self, user):
        return self.get_queryset().feed(user)


class Deck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks') # todo: maybe allow this to become NULL?
    title = models.CharField(max_length=128)
    description = models.TextField(default='')

    # starting difficulty, new cards per day, ...

    objects = DeckManager()
    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title
    
    def serialize(self): # TODO: is this needed?
        return {
            'id': self.id,
            'title': self.title,
        }


class FlashCard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='flashcards')

    front_text = models.TextField()
    back_text = models.TextField()
    # audio (front/back)
    # image (front/back)

    # intervals, dificulty, ...
    next_review = models.DateTimeField()
    graduated = models.BooleanField(default=False)
    ease = models.IntegerField(default=250) # divided by 100 in calculations TODO: Make 250 customizable
    interval = models.IntegerField(default=0)


    def __str__(self):
        return self.front_text + '  ---  ' + self.back_text


class Tag(models.Model):
    flashcard = models.ForeignKey(FlashCard, on_delete=models.CASCADE)
    tag_text = models.CharField(max_length=64)

    def __str__(self):
        return self.tag_text
