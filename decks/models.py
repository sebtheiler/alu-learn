from django.conf import settings
from django.db import models
from django.db.models import Q
from profiles.models import Profile

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

    SHARING_OPTIONS = [
        ('PRIVATE', 'Private'),
        ('FRIENDS', 'Friends only'),
        ('PUBLIC', 'Public'),
    ]
    sharing_setting = models.CharField(
        max_length=7,
        choices=SHARING_OPTIONS,
        default='PRIVATE',
    )

    ALGORITHM_OPTIONS = [
        ('ANKI', 'Default Anki Settings'),
        ('ANKING', 'Optimized Anki Settings'),
        # ('SM-18', 'SuperMemo-18'),
        # ('CUSTOM', 'Custom'),
    ]
    scheduling_algorithm = models.CharField(
        max_length=10,
        choices=ALGORITHM_OPTIONS,
        default='ANKI',
    )

    # TODO: starting difficulty, new cards per day, ...

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
    tags = models.CharField(default='', max_length=1024, blank=True)

    front_text = models.TextField()
    back_text = models.TextField()
    # audio (front/back)
    # image (front/back)

    LEARNING_STATUS_CHOICES = [
        ('LEARNING', 'Learning'),
        ('LEARNED', 'Learned'),
        ('RELEARNING', 'Relearning'),
    ]

    learning_status = models.CharField(max_length=10, choices=LEARNING_STATUS_CHOICES, default='LEARNING')
    steps_index = models.PositiveSmallIntegerField(default=0)
    ease = models.PositiveSmallIntegerField(default=250) # in percent TODO: Make 250 customizable
    next_review = models.DateTimeField()
    interval = models.PositiveSmallIntegerField(default=0) # in days

    is_suspended = models.BooleanField(default=False)
    is_leech = models.BooleanField(default=False)

    leech_index = models.PositiveSmallIntegerField(default=0)


    def __str__(self):
        return self.front_text + '  ---  ' + self.back_text


# Used to like/thank a person for making a deck
class DeckThank(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='thanks')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='thanks')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Thank from @{self.profile.user.username} for Deck #{self.deck.id}'