from __future__ import annotations # TODO: remove this when we upgrade to python 3.10

from typing import Dict, List
from django.conf import settings
from django.db import models
from django.db.models.aggregates import Avg
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from profiles.models import Profile
from django.contrib.postgres.fields import ArrayField
from copy import deepcopy

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

    # Note that although this allows for multiple creators, it is currently only using one
    # Also note that this specifies the shared deck this deck creates, not the one it is cloned from
    shared_deck = models.ForeignKey('SharedDeck', on_delete=models.SET_NULL, null=True, related_name='creators')

    objects = DeckManager()
    class Meta:
        ordering = ['-id']

    def __str__(self) -> str:
        return str(self.title)

    def create_shared_deck(self, title, description, /, sharing_setting='PUBLIC', include_copied_flashcards=False) -> Deck:
        shared_deck = SharedDeck.objects.create(
            user=self.user,
            title=title,
            description=description,
            sharing_setting=sharing_setting,
            deck_type='shared',
        )

        shared_deck.creators.add(self)

        # Clone flashcard creators and fields
        # This is very inefficient, but as it will seldomly be called,
        # I'm alright with that for now
        flashcard_creators = deepcopy(self.flashcards.prefetch_related('fields'))
        for flashcard_creator in flashcard_creators:
            if flashcard_creator.copied_from_creator and not include_copied_flashcards:
                # By default, this stops flashcards copied from another deck from being re-published
                continue
    
            # Clone flashcard creator
            shared_flashcard_creator = deepcopy(flashcard_creator)
            shared_flashcard_creator.pk = None
            shared_flashcard_creator.deck = shared_deck
            # Create a link between the origin flashcard creator and the shared flashcard creator
            shared_flashcard_creator.origin_creator = flashcard_creator

            shared_flashcard_creator.save()

            # Clone flashcard creator fields
            creator_fields = flashcard_creator.fields.all()
            for field in creator_fields:
                field.pk = None
                field.creator = shared_flashcard_creator
                field.save()
    
        return shared_deck


    def user_has_access(self, profile: Profile) -> bool:
        return (
            profile.user == self.user or # viewing own deck
            isinstance(self, SharedDeck) and (
                self.sharing_setting == 'PUBLIC' or # deck is public
                (self.sharing_setting == 'FRIENDS' and profile.user in self.user.profile.friends.all()) or # user is friend
                (self.sharing_setting == 'STUDENT' and self.attached_to.students.filter(pk=profile.pk).exists()) # user is student
            )
        )
    

    def get_statistics(self) -> Dict:
        # Get various flashcard types (only counts are used)
        unseen_flashcards = FlashCard.objects.filter(learning_status='UNSEEN', is_suspended=False, creator__deck=self)
        learning_flashcards = FlashCard.objects.filter(learning_status='LEARNING', is_suspended=False, creator__deck=self)
        learned_flashcards = FlashCard.objects.filter(learning_status='LEARNED', is_suspended=False, creator__deck=self)
        relearning_flashcards = FlashCard.objects.filter(learning_status='RELEARNING', is_suspended=False, creator__deck=self)
        suspended_flashcards = FlashCard.objects.filter(is_suspended=True, creator__deck=self)

        # Get other data
        avg_ease = FlashCard.objects.filter(
            ~Q(learning_status='UNSEEN') & Q(creator__deck=self)
        ).aggregate(Avg('ease'))['ease__avg']

        return {
            'num_unseen': unseen_flashcards.count(),
            'num_learning': learning_flashcards.count(),
            'num_learned': learned_flashcards.count(),
            'num_relearning': relearning_flashcards.count(),
            'num_suspended': suspended_flashcards.count(),
            'avg_ease': avg_ease,
        }


class SharedDeckRelation(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='shared_deck_relations')
    shared_deck = models.ForeignKey('SharedDeck', on_delete=models.CASCADE, related_name='children_decks')
    cloned_at_version = models.IntegerField(default=0) # used to know when the deck is outdated

    def __str__(self) -> str:
        return f'{self.shared_deck.title} ==> {self.deck.title}'


class FlashCardCreatorManager(models.Manager):
    def get_queryset(self) -> QuerySet:
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

    def __str__(self) -> str:
        return f'Flashcard Creator in {self.deck.title} by @{self.deck.user.username}'

    def has_tag(self, tag: str) -> bool:
        return tag in [tag.strip() for tag in self.tags.split(',')]

    def add_tag(self, tag: str, save: bool=True) -> str:
        if self.has_tag(tag):
            return
        elif self.tags.strip() == '':
            self.tags = tag
        else:
            self.tags += f', {tag}'

        if save:
            self.save()

        return self.tags
    
    def remove_tag(self, tag: str, save: bool=True):
        if not self.has_tag(tag):
            return
        elif self.tags.strip() == tag:
            self.tags = ''
        elif self.tags.startswith(tag):
            self.tags = self.tags.replace(f'{tag}, ', '')
        else:
            self.tags = self.tags.replace(f', {tag}', '')

        if save:
            self.save()

        return self.tags


class FlashCardField(models.Model):
    creator = models.ForeignKey(FlashCardCreator, on_delete=models.CASCADE, related_name='fields')
    text = models.JSONField(null=True)
    field_number = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ['field_number']

    def __str__(self) -> str:
        try:
            return str(self.text[0]['children'][0]['text'])
        except KeyError:
            return '<< Couldn\'t get text easily >>'


class FlashCardManager(models.Manager):
    def get_queryset(self) -> QuerySet:
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

    def get_content(self) -> List[str]:
        fields = self.creator.fields.all()
        return [fields[i] for i in self.content_indicies]

    def __str__(self) -> str:
        return str(self.get_content())
    
    def is_leech(self) -> bool:
        return self.creator.has_tag('leech')
    
    def set_is_leech(self, is_leech: bool, save: bool=True) -> str:
        creator = self.creator
        if is_leech:
            creator.add_tag('leech', save)
        else:
            creator.remove_tag('leech', save)

        return creator.tags


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
    def get_queryset(self) -> QuerySet:
        # TODO: use prefetches for more default things
        return super().get_queryset().prefetch_related('deck').prefetch_related('deck__user')


class DeckStudySessionManager(StudySessionManager):
    deck = models.OneToOneField(Deck, on_delete=models.CASCADE, related_name='study_session_manager')

    objects = DeckStudySessionManagerModelManager()

    def __str__(self) -> str:
        return f'SSM for "{self.deck.title}" by @{self.deck.user.username}'


class CustomStudySessionManager(StudySessionManager):
    title = models.CharField(max_length=128)

    # Filter parameters
    deck_ids = models.CharField(default='', blank=True, max_length=1024)
    tags = models.CharField(default='', blank=True, max_length=1024)
    contains = models.CharField(default='', blank=True, max_length=1024)
    leech = models.BooleanField(null=True, blank=True)
    learning_status = models.CharField(null=True, blank=True, max_length=10)
    min_ease = models.PositiveSmallIntegerField(null=True, blank=True)
    max_ease = models.PositiveSmallIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f'CSSM: "{self.title}" by @{self.user}'


class SharedDeck(Deck):
    description = models.TextField(default='', blank=True, null=True)
    version_number = models.IntegerField(default=0) # this number is incremented anytime changes are pushed

    SHARING_OPTIONS = [
        ('PRIVATE', 'Private'),
        ('FRIENDS', 'Friends only'),
        ('PUBLIC', 'Public'),
        ('STUDENT', 'Students only (for teachers)'),
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

    def __str__(self) -> str:
        return f'Thank from @{self.profile.user.username} for Deck #{self.deck.id}'


class DeckClone(models.Model):
    deck = models.ForeignKey(SharedDeck, on_delete=models.CASCADE, related_name='clones')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='clones')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'Clone from @{self.profile.user.username} for Deck #{self.deck.id}'
