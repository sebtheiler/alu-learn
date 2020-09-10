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

    # Get the home deck page for a user
    def home(self, user):
        # Order alphabetically, not by order added
        home_qs = self.filter(user__username=user.username).order_by('title')
        return home_qs


class DeckManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return DeckQuerySet(self.model, using=self._db)

    def home(self, user):
        return self.get_queryset().home(user)


class Deck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
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

    # Customizable settings
    daily_new_card_limit = models.PositiveSmallIntegerField(default=20)
    new_cards_done_today = models.PositiveSmallIntegerField(default=0)
    shuffle_unseen_cards = models.BooleanField(default=True)


    objects = DeckManager()
    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title


class FlashCard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='flashcards')
    tags = models.CharField(default='', max_length=1024, blank=True)

    front_text = models.TextField()
    back_text = models.TextField()
    # audio (front/back)
    # image (front/back)

    LEARNING_STATUS_CHOICES = [
        ('UNSEEN', 'Unseen/New'),
        ('LEARNING', 'Learning'),
        ('LEARNED', 'Learned'),
        ('RELEARNING', 'Relearning'),
    ]

    learning_status = models.CharField(max_length=10, choices=LEARNING_STATUS_CHOICES, default='UNSEEN')
    steps_index = models.PositiveSmallIntegerField(default=0)
    ease = models.PositiveSmallIntegerField(default=250) # in percent TODO: Make 250 customizable
    next_review = models.DateTimeField()
    interval = models.PositiveSmallIntegerField(default=0) # in days

    is_suspended = models.BooleanField(default=False)

    leech_index = models.PositiveSmallIntegerField(default=0)


    def __str__(self):
        return self.front_text + '  ---  ' + self.back_text
    
    def is_leech(self):
        # Get whether the card is a leech or not, based on whether
        # it has the tag 'leech'
        # The split is required so that the tag 'daoijdaleechadajda' is not
        # marked as a leech.
        return 'leech' in [tag.strip() for tag in self.tags.split(',')]
    
    def set_is_leech(self, is_leech, save=True):
        if is_leech:
            if self.is_leech():
                return
            if self.tags.strip() == '':
                self.tags = 'leech'
            else:
                self.tags += ', leech'
        else:
            self.tags = self.tags.replace(', leech', '')

        if save:
            self.save()

# Used to like/thank a person for making a deck
class DeckThank(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='thanks')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='thanks')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Thank from @{self.profile.user.username} for Deck #{self.deck.id}'