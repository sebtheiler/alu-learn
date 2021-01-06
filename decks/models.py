from django.conf import settings
from django.db import models
from profiles.models import Profile
from django.contrib.postgres.fields import ArrayField, JSONField

# Create your models here.
User = settings.AUTH_USER_MODEL


class DeckManager(models.Manager):
    def get_or_new(self, **kwargs):
        try:
            return self.get(**kwargs), False
        except self.model.DoesNotExist:
            return self.model(**kwargs), True

class Deck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=128)
    deck_type = models.CharField(default='standard', max_length=12)
    shared_deck = models.ForeignKey('SharedDeck', on_delete=models.SET_NULL, null=True, related_name='creators') # note that although this allows for multiple creators, it is currently only using one

    objects = DeckManager()
    class Meta:
        ordering = ['-id']

    def __str__(self):
        return str(self.title)


class SharedDeckRelation(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='shared_deck_relations')
    shared_deck = models.ForeignKey('SharedDeck', on_delete=models.CASCADE, related_name='children_decks')
    cloned_at_version = models.IntegerField(default=0) # used to know when the deck is outdated

    def __str__(self):
        return f'{self.shared_deck.title} ==> {self.deck.title}'


class FlashCardCreatorManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related('deck')


class FlashCardCreator(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='flashcards')
    tags = models.CharField(default='', max_length=1024, blank=True)
    flashcard_type = models.CharField(default='basic', max_length=16)
    flashcard_num = models.PositiveSmallIntegerField() # zero-indexed
    origin_creator = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, related_name='shared_mirror')
    # on_delete of the next line needs to be changed for pulling deletes to work properly
    copied_from_creator = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='flashcards_copied_from')
    was_updated = models.BooleanField(default=False) # used when updating shared decks
    # Also contains information about fields and generated flashcards

    objects = FlashCardCreatorManager()
    class Meta:
        ordering = ['flashcard_num']

    def __str__(self):
        return f'Flashcard Creator in {self.deck.title} by @{self.deck.user.username}'


class FlashCardField(models.Model):
    creator = models.ForeignKey(FlashCardCreator, on_delete=models.CASCADE, related_name='fields')
    text = JSONField(null=True)
    field_number = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ['field_number']

    def __str__(self):
        try:
            return str(self.text[0]['children'][0]['text'])
        except KeyError:
            return '<< Couldn\'t get text easily >>'


class FlashCardManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related('creator__fields')


class FlashCard(models.Model):
    creator = models.ForeignKey(FlashCardCreator, on_delete=models.CASCADE, related_name='review_instances')
    content_indicies = ArrayField(models.PositiveSmallIntegerField())

    # `name` can be used for many purposes
    # Cloze cards use it to dfferentiate which "number cloze" the flashcard is for
    # Basic and Reversed cards do not use this value
    name = models.CharField(blank=True, null=True, default=None, max_length=12)

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

    is_suspended = models.BooleanField(default=False)
    leech_index = models.PositiveSmallIntegerField(default=0)


    objects = FlashCardManager()
    class Meta:
        ordering = ['creator__flashcard_num']

    def get_content(self):
        fields = self.creator.fields.all()
        return [fields[i] for i in self.content_indicies]

    def __str__(self):
        return str(self.get_content())
    
    def is_leech(self):
        # Get whether the card is a leech or not, based on whether
        # it has the tag 'leech'
        return 'leech' in [tag.strip() for tag in self.creator.tags.split(',')]
    
    def set_is_leech(self, is_leech, save=True):
        if is_leech:
            if self.is_leech():
                return
            elif self.creator.tags.strip() == '':
                self.creator.tags = 'leech'
            else:
                self.creator.tags += ', leech'
        else:
            if not self.is_leech():
                return
            elif self.creator.tags.strip() == 'leech':
                self.creator.tags = ''
            else:
                self.creator.tags = self.creator.tags.replace(', leech', '')

        if save:
            self.creator.save()


class StudySessionManager(models.Model):
    user = models.ForeignKey(Profile, null=True, on_delete=models.CASCADE, related_name='study_session_managers')

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

    shuffle_unseen_cards = models.BooleanField(default=True)
    review_ahead_minutes = models.PositiveIntegerField(default=120)

    daily_new_card_limit = models.PositiveSmallIntegerField(default=20)
    new_cards_done_today = models.PositiveSmallIntegerField(default=0)
    last_flashcard_date = models.DateField()
    
    DIFFICULTY_OPTIONS = [
        ('HARD', 'Memorize Everything'),
        ('NORM', 'Memorize Most Things'),
        ('EASY', 'Get the Overview'),
    ]
    difficulty = models.CharField(
        max_length=4,
        choices=DIFFICULTY_OPTIONS,
        default='HARD',
    )


class DeckStudySessionManagerModelManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related('deck')


class DeckStudySessionManager(StudySessionManager):
    deck = models.OneToOneField(Deck, on_delete=models.CASCADE, related_name='study_session_manager')

    objects = DeckStudySessionManagerModelManager()

    def __str__(self):
        return f'SSM for "{self.deck.title}" by @{self.deck.user.username}'


class CustomStudySessionManager(StudySessionManager):
    title = models.CharField(max_length=128)

    # Filter parameters
    deck_ids = models.CharField(default='', blank=True, max_length=1024)
    tags = models.CharField(default='', blank=True, max_length=1024)
    contains = models.CharField(default='', blank=True, max_length=1024)
    leech = models.NullBooleanField(null=True, blank=True)
    learning_status = models.CharField(null=True, blank=True, max_length=10)
    min_ease = models.PositiveSmallIntegerField(null=True, blank=True)
    max_ease = models.PositiveSmallIntegerField(null=True, blank=True)


class SharedDeck(Deck):
    description = models.TextField(default='', blank=True, null=True)
    version_number = models.IntegerField(default=0) # this number is incremented anytime changes are pushed

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


# Used to like/thank a person for making a deck
class DeckThank(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='thanks')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='thanks')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Thank from @{self.profile.user.username} for Deck #{self.deck.id}'


class DeckClone(models.Model):
    deck = models.ForeignKey(SharedDeck, on_delete=models.CASCADE, related_name='clones')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='clones')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Clone from @{self.profile.user.username} for Deck #{self.deck.id}'
