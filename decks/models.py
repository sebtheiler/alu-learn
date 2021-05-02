from __future__ import \
    annotations  # TODO: remove this when we upgrade to python 3.10
import datetime as dt
from itertools import chain
import random

import re
import json
from typing import Dict, List, Literal, Tuple, Union

from django.utils import timezone
from utils.utils import get_morning
import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.aggregates import Avg
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from profiles.models import Profile

User = settings.AUTH_USER_MODEL
FlashCardTypes = Literal['cloze', 'basic', 'reversed']
LearningStatusType = Literal['UNSEEN', 'LEARNING', 'LEARNED', 'RELEARNING']


class DeckManager(models.Manager):
    def get_or_new(self, **kwargs) -> Tuple[Deck, bool]:
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
    shared_deck = models.ForeignKey(
        'SharedDeck',
        on_delete=models.SET_NULL,
        null=True,
        related_name='creators'
    )

    # Specifies which classroom a student has attatched this deck to (if any)
    student_attached_to = models.ForeignKey(
        'teachers.Classroom',
        models.SET_NULL,
        related_name='attached_student_decks',
        null=True,
        blank=True,
    )

    # Since deck updates can take a few seconds, there is a lock on the update
    # condition of decks so that two updates aren't triggered at the same time
    is_updating = models.BooleanField(default=False)

    objects = DeckManager()

    class Meta:
        ordering = ['-id']

    def __str__(self) -> str:
        return str(self.title)

    def create_shared_deck(
        self,
        title: str,
        description: str,
        /,
        sharing_setting: str = 'PUBLIC',
        include_copied_flashcards: bool = False,
    ) -> SharedDeck:
        shared_deck = SharedDeck.objects.create(
            user=self.user,
            title=title,
            description=description,
            sharing_setting=sharing_setting,
            deck_type='shared',
        )  # type: SharedDeck

        shared_deck.creators.add(self)

        # Clone flashcard creators and fields
        flashcard_creators = self.flashcards.\
            prefetch_related('fields').\
            prefetch_related('review_instances')  # type: List[FlashCardCreator]

        creators_to_create = []
        fields_to_create = []

        for flashcard_creator in flashcard_creators:
            if flashcard_creator.copied_from_creator and not include_copied_flashcards:
                # By default, this stops flashcards copied from another deck from being re-published
                continue

            # Clone flashcard creator
            shared_flashcard_creator = FlashCardCreator(
                deck=shared_deck,
                tags=flashcard_creator.tags,
                flashcard_type=flashcard_creator.flashcard_type,
                flashcard_num=flashcard_creator.flashcard_num,
                origin_creator=flashcard_creator,
            )
            creators_to_create.append(shared_flashcard_creator)

            # Clone flashcard creator fields
            creator_fields = flashcard_creator.fields.all()
            fields = [FlashCardField(
                creator=shared_flashcard_creator,
                text=field.text,
                field_number=field.field_number,
            ) for field in creator_fields]
            fields_to_create += fields

        FlashCardCreator.objects.bulk_create(creators_to_create)
        FlashCardField.objects.bulk_create(fields_to_create)

        return shared_deck

    def user_has_access(self, user: User) -> bool:
        return self.user == user

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

    def pull_updates(self, shared_deck: SharedDeck) -> Deck:
        # Since updating can take a few seconds, we have a lock
        # here so that two updates can't be initiated at once
        if self.is_updating:
            raise ValueError('Deck is already updating')

        self.is_updating = True
        self.save()

        local_flashcard_creators = FlashCardCreator.objects.filter(
            deck=self,
            copied_from_deck=shared_deck,
        )  # type: List[FlashCardCreator]
        shared_flashcard_creators = shared_deck.flashcards.all() \
            .prefetch_related('fields')  # type: List[FlashCardCreator]

        creators_to_create = []  # type: List[FlashCardCreator]
        flashcards_to_create = []  # type: List[FlashCard]
        fields_to_create = []  # type: List[FlashCardField]
        creators_to_update = []  # type: List[FlashCardCreator]
        fields_to_update = []  # type: List[FlashCardField]
        creators_not_to_delete = []  # type: List[str]
        for shared_flashcard_creator in shared_flashcard_creators:
            try:
                local_flashcard_creator = local_flashcard_creators.get(
                    copied_from_creator=shared_flashcard_creator,
                )  # type: FlashCardCreator
            except FlashCardCreator.DoesNotExist:
                local_flashcard_creator = None

            if local_flashcard_creator is None:
                new_creator, new_flashcards, new_fields = shared_flashcard_creator.clone(
                    self,
                )
                creators_to_create.append(new_creator)
                creators_not_to_delete.append(new_creator.pk)
                flashcards_to_create += new_flashcards
                fields_to_create += new_fields
            else:
                # Update existing flashcard creator
                creator, updated_fields, _ = local_flashcard_creator.update(
                    creator_to_get_updates_from=shared_flashcard_creator,
                )
                creators_to_update.append(creator)
                creators_not_to_delete.append(creator.pk)
                fields_to_update += updated_fields

        # Create all flashcard review instances
        FlashCardCreator.objects.bulk_create(creators_to_create)
        FlashCardField.objects.bulk_create(fields_to_create)
        FlashCard.objects.bulk_create(flashcards_to_create)
        FlashCardCreator.objects.bulk_update(
            creators_to_update,
            ['tags', 'flashcard_num'],
        )
        FlashCardField.objects.bulk_update(
            fields_to_update,
            ['text'],
        )

        # Delete all flashcards that weren't updated
        not_updated = local_flashcard_creators.filter(~Q(pk__in=creators_not_to_delete))
        not_updated.delete()

        # Bump version number and return
        shared_deck_relation = self.shared_deck_relations.get(shared_deck=shared_deck)
        shared_deck_relation.cloned_at_version = shared_deck.version_number
        shared_deck_relation.save()

        self.is_updating = False
        self.save()

        return self

    def calc_percent_complete(self, flashcards: QuerySet[FlashCard] = None):
        if flashcards is None:
            flashcards = FlashCard.objects.filter(creator__deck=self)
        else:
            flashcards = flashcards.filter(creator__deck=self)
        total_flashcard_num = flashcards.count()
        unseen_flashcard_num = flashcards.filter(learning_status='UNSEEN').count()

        try:
            return (total_flashcard_num - unseen_flashcard_num) / total_flashcard_num
        except ZeroDivisionError:
            return 0

    def list_available_updates(self):
        needs_updating = []
        for shared_deck_relation in self.shared_deck_relations.all().prefetch_related('shared_deck'):
            if shared_deck_relation.cloned_at_version < shared_deck_relation.shared_deck.version_number:
                needs_updating.append({
                    'title': shared_deck_relation.shared_deck.title,
                    'id': shared_deck_relation.shared_deck.id,
                })

        return needs_updating


class SharedDeckRelation(models.Model):
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='shared_deck_relations',
    )
    shared_deck = models.ForeignKey(
        'SharedDeck',
        on_delete=models.CASCADE,
        related_name='children_decks',
    )
    cloned_at_version = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f'{self.shared_deck.title} ==> {self.deck.title}'


class FlashCardCreatorManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('deck')


class FlashCardCreator(models.Model):
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='flashcards',
    )  # type: Deck
    tags = models.CharField(default='', max_length=1024, blank=True)
    flashcard_type = models.CharField(default='basic', max_length=16)
    flashcard_num = models.PositiveSmallIntegerField()  # zero-indexed

    # Used when creating a shared deck
    origin_creator = models.OneToOneField(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        related_name='shared_mirror',
    )
    # This is used when cloning decks, to remember where the cloned creator came from
    copied_from_deck = models.ForeignKey(
        Deck,
        on_delete=models.SET_NULL,
        null=True,
        related_name='flashcards_copied_from',
    )  # type: Deck
    copied_from_creator = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        related_name='flashcards_copied_from',
    )  # type: FlashCardCreator

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    objects = FlashCardCreatorManager()

    class Meta:
        ordering = ['flashcard_num']

    def __str__(self) -> str:
        return f'Flashcard Creator in {self.deck.title} by @{self.deck.user.username}'

    def has_tag(self, tag: str) -> bool:
        return tag in [tag.strip() for tag in self.tags.split(',')]

    def add_tag(self, tag: str, save: bool = True) -> str:
        if self.has_tag(tag):
            return
        elif self.tags.strip() == '':
            self.tags = tag
        else:
            self.tags += f', {tag}'

        if save:
            self.save()

        return self.tags

    def remove_tag(self, tag: str, save: bool = True) -> str:
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

    def rename_tag(self, tag: str, rename_to: str, save: bool = True) -> str:
        self.tags = self.tags.replace(tag, rename_to)

        if save:
            self.save()

        return self.tags

    @staticmethod
    def get_max_creator_num(deck: Deck) -> int:
        # Returns -1 if there are no flashcard creator in the deck
        creators = FlashCardCreator.objects.filter(deck=deck)
        max_fc_num_obj = creators.order_by('-flashcard_num').first()

        return max_fc_num_obj.flashcard_num if max_fc_num_obj else -1

    @staticmethod
    def create_flashcard(
        deck: Deck,
        tags: str,
        flashcard_type: FlashCardTypes,
        fields: List[list],
    ) -> List[FlashCard]:
        creator = FlashCardCreator.objects.create(
            deck=deck,
            tags=tags,
            flashcard_type=flashcard_type,
            flashcard_num=FlashCardCreator.get_max_creator_num(deck) + 1,
        )

        FlashCardField.objects.bulk_create([
            FlashCardField(
                creator=creator,
                text=text,
                field_number=i,
            )
            for i, text in enumerate(fields)
        ])

        flashcards = FlashCard.create_review_instance(
            flashcard_type,
            creator,
            fields[0],
        )
        FlashCard.objects.bulk_create(flashcards)

        return flashcards

    def clone(
        self,
        new_deck: Deck = None,
        origin_or_copied: Literal['COPIED', 'ORIGIN'] = 'COPIED',
        skip_creating_review_instances: bool = False,
    ) -> Tuple[FlashCardCreator, List[FlashCard], List[FlashCardField]]:
        """
        Clones and saves a full copy of a flashcard creator
        (returns--but does not create--the creator's review instances)
        """
        new_flashcard_creator = FlashCardCreator(
            deck=new_deck or self.deck,
            tags=self.tags,
            flashcard_num=self.flashcard_num,
            flashcard_type=self.flashcard_type,
            id=uuid.uuid4(),
        )

        if origin_or_copied == 'COPIED':
            new_flashcard_creator.origin_creator = None
            new_flashcard_creator.copied_from_creator = self
            new_flashcard_creator.copied_from_deck = self.deck
        elif origin_or_copied == 'ORIGIN':
            new_flashcard_creator.origin_creator = self
            new_flashcard_creator.copied_from_creator = None
        else:
            raise ValueError('Invlaid value for `origin_or_copied`')

        # Clone the flashcard creator's fields
        new_fields = [FlashCardField(
            creator=new_flashcard_creator,
            field_number=field.field_number,
            text=field.text,
        ) for field in self.fields.all()]

        # Derive the flashcards review instances from the creator
        if not skip_creating_review_instances:
            new_flashcards = FlashCard.create_review_instance(
                new_flashcard_creator.flashcard_type,
                new_flashcard_creator,
                new_fields[0].text,
            )
        else:
            new_flashcards = None

        return new_flashcard_creator, new_flashcards, new_fields

    def update(
        self,
        creator_to_get_updates_from: FlashCardCreator,
        check_diff_only: bool = False,
    ) -> Tuple[FlashCardCreator, bool]:
        # FIXME: this function does not work for cloze, when the number of RIs changes
        # Keep track if there were any actual changes
        actual_difference = False

        # Update flashcard fields
        fields_to_update = self.fields.all()
        fields_to_get_updates_from = creator_to_get_updates_from.fields.all()

        updated_fields = []
        for field_with_updates in fields_to_get_updates_from:
            try:
                field_to_update = fields_to_update.get(
                    field_number=field_with_updates.field_number
                )

                if field_to_update.text != field_with_updates.text:
                    if not check_diff_only:
                        field_to_update.text = field_with_updates.text
                        updated_fields.append(field_to_update)
                    actual_difference = True
            except FlashCardField.DoesNotExist:
                if not check_diff_only:
                    # NOTE: this could be made into a bulk operation,
                    # but it happens so infrequently that it would be
                    # less efficient
                    FlashCardField.objects.create(
                        creator=self,
                        text=field_with_updates.text,
                        field_number=field_with_updates.field_number,
                    )
                actual_difference = True
                continue

        # Update tags, order, and mark as being updated
        if self.tags != creator_to_get_updates_from.tags:
            if not check_diff_only:
                self.tags = creator_to_get_updates_from.tags
            actual_difference = True

        if self.flashcard_num != creator_to_get_updates_from.flashcard_num:
            if not check_diff_only:
                self.flashcard_num = creator_to_get_updates_from.flashcard_num
            actual_difference = True

        return self, updated_fields, actual_difference

    def rearrange(
        self,
        rearrange_type: Literal['UP', 'DOWN'],
    ) -> Union[None, str]:
        if self.deck.deck_type != 'standard':
            return 'Can only rearrange flashcards on standard decks'

        if rearrange_type == 'UP':
            if self.flashcard_num == 0:
                return 'Flashcard already at top'

            above_flashcard = self.deck.flashcards.get(
                flashcard_num=self.flashcard_num - 1
            )
            above_flashcard.flashcard_num += 1
            self.flashcard_num -= 1

            FlashCardCreator.objects.bulk_update([self, above_flashcard], ['flashcard_num'])
        elif rearrange_type == 'DOWN':
            if self.flashcard_num == FlashCardCreator.get_max_creator_num(self.deck):
                return 'Flashcard already at bottom'

            below_flashcard = self.deck.flashcards.get(
                flashcard_num=self.flashcard_num + 1
            )
            below_flashcard.flashcard_num -= 1
            self.flashcard_num += 1

            FlashCardCreator.objects.bulk_update([self, below_flashcard], ['flashcard_num'])
        else:
            return 'Invalid `rearrange_type`'


class FlashCardField(models.Model):
    creator = models.ForeignKey(
        FlashCardCreator,
        on_delete=models.CASCADE,
        related_name='fields'
    )
    text = models.JSONField(null=True)
    field_number = models.PositiveSmallIntegerField()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

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


CONTENT_INDICIES_DICT = {
    'BASIC': [
        # Front to back
        [0, 1],
    ],
    'REVERSED': [
        # Front to back and back to front
        [0, 1],
        [1, 0],
    ],
    'CLOZE': [
        # One sided
        [0],
    ],
}


class FlashCard(models.Model):
    creator = models.ForeignKey(
        FlashCardCreator,
        on_delete=models.CASCADE,
        related_name='review_instances',
    )  # type: FlashCardCreator
    content_indicies = ArrayField(models.PositiveSmallIntegerField())

    # `name` can be used for many purposes
    # Cloze cards use it to dfferentiate which "number cloze" the flashcard is
    # Basic and Reversed cards do not use this value
    name = models.CharField(blank=True, null=True, default=None, max_length=12)

    LEARNING_STATUS_CHOICES = [
        ('UNSEEN', 'Unseen/New'),
        ('LEARNING', 'Learning'),
        ('LEARNED', 'Learned'),
        ('RELEARNING', 'Relearning'),
    ]

    learning_status = models.CharField(
        max_length=10,
        choices=LEARNING_STATUS_CHOICES,
        default='UNSEEN',
    )  # type: str
    steps_index = models.PositiveSmallIntegerField(default=0)
    ease = models.PositiveSmallIntegerField(default=250)
    next_review = models.DateTimeField()
    interval = models.PositiveSmallIntegerField(default=0)  # in days

    is_suspended = models.BooleanField(default=False)
    leech_index = models.PositiveSmallIntegerField(default=0)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

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

    def set_is_leech(self, is_leech: bool, save: bool = True) -> str:
        creator = self.creator
        if is_leech:
            creator.add_tag('leech', save)
        else:
            creator.remove_tag('leech', save)

        return creator.tags

    @staticmethod
    def create_review_instance(
        flashcard_type: FlashCardTypes,
        creator: FlashCardCreator,
        field: str = None,
    ) -> List[FlashCard]:
        """
        Function for creating flashcard review instances, given a flashcard
            type, creator, and text for cloze

        `flashcard_type`: Type of the flashcard to create
            (e.g., 'cloze', 'basic', 'reversed')
        `creator`: FlashCardCreator object that will house this flashcard
            review instance
        `field`: Only needed for cloze flashcards, provides the text to parse
            with regex to get cloze instances
        """
        # Get background information
        this_morning = get_morning()

        try:
            all_content_indicies = CONTENT_INDICIES_DICT[flashcard_type.upper()]
        except KeyError:
            raise ValueError(f'Flashcard type "{flashcard_type}" unrecognized')

        # Create flashcard review instance
        if flashcard_type == 'cloze':
            # Create a flashcard for each cloze segment
            cloze_ids = []

            def cloze_flashcard(match):
                cloze_id = int(match.group().split(":")[0][3:])
                cloze_ids.append(cloze_id)

                return FlashCard(
                    creator=creator,
                    next_review=this_morning,
                    content_indicies=[0],
                    name=f'cloze-{cloze_id}'
                )

            return [
                cloze_flashcard(match)
                for match in re.finditer(
                    r"{{c\d*::.*?}}", json.dumps(field), re.MULTILINE
                ) if int(match.group().split("::")[0][3:]) not in cloze_ids
            ]
        else:
            # Create a flashcard for each field
            return [
                FlashCard(
                    creator=creator,
                    next_review=this_morning,
                    content_indicies=all_content_indicies[i],
                )
                for i in range(len(all_content_indicies))
            ]

    @staticmethod
    def search_tags(tags: str) -> Q:
        query = Q()

        separated_tags = [el.strip() for el in re.split('(AND)|(OR)', tags) if el is not None]
        i = 0
        while i < len(separated_tags):
            if separated_tags[i] in ('AND', 'OR'):
                i += 1
                continue

            previous_operator = separated_tags[i - 1] if i > 0 else None
            contains_query = Q(creator__tags__icontains=separated_tags[i])

            # Invert the query if it starts with NOT
            if separated_tags[i].startswith('NOT '):
                contains_query = ~Q(creator__tags__icontains=separated_tags[i].replace('NOT ', ''))

            # Decide how to merge the query, based on the previous value being AND or OR
            if previous_operator == 'AND' or previous_operator is None:
                query &= contains_query
            elif previous_operator == 'OR':
                query |= contains_query
            else:
                raise ValueError('Invalid tags query')

            i += 1

        return query

    @staticmethod
    def search_flashcards(
        user: User,
        deck_ids: str = None,  # '1,3,10'
        tags: str = None,  # 'a AND NOT b'
        contains: str = None,
        suspended: Literal['true', 'false'] = None,
        leech: Literal['true', 'false'] = None,
        learning_status: LearningStatusType = None,
        min_ease: str = None,
        max_ease: str = None,
        due_before: timezone.datetime.date = None,
        custom_query: Q = None,
        return_query_only: bool = False,
    ) -> Union[Q, QuerySet[FlashCard]]:
        # Search flashcards
        # We will be ANDing (&=) a bunch more queries to this
        # and using it as a filter in the end.
        flashcard_query = Q(creator__deck__user__pk=user.pk)

        # Filter by deck Id
        if deck_ids:
            flashcard_query &= Q(creator__deck__pk__in=deck_ids.split(','))

        # Filter by tags (and leech)
        # Note: using __icontains is not perfect, since it would have "car" appear in "carpet"
        if tags or leech is not None:
            tag_query = Q()
            if tags:
                tag_query &= FlashCard.search_tags(tags)

            # Also filter by leech, since it's a tag
            if str(leech).lower() == 'true' or (isinstance(leech, bool) and leech):
                tag_query &= Q(creator__tags__icontains='leech')
            elif str(leech).lower() == 'false' or (isinstance(leech, bool) and not leech):
                tag_query &= ~Q(creator__tags__icontains='leech')

            flashcard_query &= tag_query

        # Filter by contains
        if contains:
            flashcard_query &= Q(creator__fields__text__icontains=contains)

        # Filter by suspended and learning status
        if suspended is not None:
            if isinstance(suspended, str):
                suspended = suspended.lower() == 'true'
            flashcard_query &= Q(is_suspended=suspended)

        if learning_status is not None:
            flashcard_query &= Q(learning_status__iexact=learning_status)

        # Filter by min/max ease
        if min_ease is not None:
            flashcard_query &= Q(ease__gte=int(min_ease))

        if max_ease is not None:
            flashcard_query &= Q(ease__lte=int(max_ease))

        # Filter by due date
        if due_before:
            flashcard_query &= Q(next_review__lt=due_before)

        # Allow a custom query for efficiency
        if custom_query:
            flashcard_query &= custom_query

        # Execute query
        if return_query_only:
            return flashcard_query
        else:
            return FlashCard.objects \
                .filter(flashcard_query) \
                .prefetch_related('creator') \
                .distinct()


class StudySessionManager(models.Model):
    user = models.ForeignKey(
        Profile,
        null=True,
        on_delete=models.CASCADE,
        related_name='study_session_managers',
    )

    ALGORITHM_OPTIONS = [
        ('ANKI', 'Default Anki Settings'),
        ('ANKING', 'Optimized Anki Settings'),
    ]
    scheduling_algorithm = models.CharField(
        max_length=10,
        choices=ALGORITHM_OPTIONS,
        default='ANKING',
    )

    shuffle_unseen_cards = models.BooleanField(default=False)
    review_ahead_minutes = models.PositiveIntegerField(default=120)

    daily_new_card_limit = models.PositiveSmallIntegerField(default=20)
    new_cards_done_today = models.PositiveSmallIntegerField(default=0)

    daily_seen_card_limit = models.PositiveSmallIntegerField(default=200)
    seen_cards_done_today = models.PositiveSmallIntegerField(default=0)

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

    def calc_review_cutoff(self) -> dt.date:
        # Calculate the review cutoff time using `review_ahead_minutes`

        now = timezone.now()
        review_cutoff = min(  # if the user is studying late, don't get flashcards from tomorrow
            now + dt.timedelta(minutes=self.review_ahead_minutes),
            dt.datetime.combine(
                dt.date.today() + dt.timedelta(days=1),
                dt.datetime.min.time(),
                tzinfo=dt.timezone.utc,
            )  # .combine is needed to convert the date object to a datetime object
        )

        return review_cutoff

    def get_reviews(
        self,
        seen_flashcards: QuerySet[FlashCard],
        unseen_flashcards: QuerySet[FlashCard],
    ) -> QuerySet[FlashCard]:
        # Get the earliest seen flashcards under the limit
        seen_flashcard_count = max(self.daily_seen_card_limit - self.seen_cards_done_today, 0)
        seen_flashcards = seen_flashcards.order_by(
            'next_review'
        )[:seen_flashcard_count]

        # Determine which unseen flashcards to show
        unseen_flashcard_count = self.daily_new_card_limit - self.new_cards_done_today
        if unseen_flashcard_count > 0:
            if self.shuffle_unseen_cards:
                unseen_flashcards = random.sample(
                    list(unseen_flashcards),
                    min(unseen_flashcard_count, unseen_flashcards.count()),
                )
            else:
                unseen_flashcards = unseen_flashcards[:unseen_flashcard_count]
        else:
            unseen_flashcards = []

        # Combine seen and unseen flashcards
        flashcards = list(chain(seen_flashcards, unseen_flashcards))

        return flashcards


class DeckStudySessionManagerModelManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('deck', 'deck__user')


class DeckStudySessionManager(StudySessionManager):
    deck = models.OneToOneField(
        Deck,
        on_delete=models.CASCADE,
        related_name='study_session_manager',
    )

    objects = DeckStudySessionManagerModelManager()

    def __str__(self) -> str:
        return f'SSM for "{self.deck.title}" by @{self.deck.user.username}'

    def get_flashcards(self) -> Tuple[QuerySet[FlashCard], QuerySet[FlashCard]]:
        review_cutoff = self.calc_review_cutoff()

        ssm_flashcards = FlashCard.objects.filter(
            creator__deck__pk=self.deck.pk
        )
        seen_flashcards = ssm_flashcards.filter(
            Q(next_review__lt=review_cutoff) &
            ~Q(learning_status__iexact='UNSEEN') &
            Q(is_suspended=False)
        )
        unseen_flashcards = ssm_flashcards.filter(
            learning_status__iexact='UNSEEN',
            is_suspended=False,
        )

        return seen_flashcards, unseen_flashcards


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

    def get_flashcards(self) -> Tuple[QuerySet[FlashCard], QuerySet[FlashCard]]:
        review_cutoff = self.calc_review_cutoff()

        searched_flashcards = FlashCard.search_flashcards(
            self.user,
            self.deck_ids,
            self.tags,
            self.contains,
            False,  # suspended (can't study suspended cards)
            self.leech,
            self.learning_status,
            self.min_ease,
            self.max_ease,
            review_cutoff,
        )

        seen_flashcards = searched_flashcards.filter(~Q(learning_status__iexact='UNSEEN'))
        unseen_flashcards = searched_flashcards.filter(learning_status__iexact='UNSEEN')

        return seen_flashcards, unseen_flashcards


class SharedDeck(Deck):
    description = models.TextField(default='', blank=True, null=True)
    version_number = models.IntegerField(default=0)

    SHARING_OPTIONS = [
        ('FRIENDS', 'Friends only'),
        ('PUBLIC', 'Public'),
        ('STUDENT', 'Students only (for teachers)'),
    ]
    sharing_setting = models.CharField(
        max_length=7,
        choices=SHARING_OPTIONS,
        default='PRIVATE',
    )

    def clone(
        self,
        user: User,
        destination_deck_title: str = None,
        options: dict = {},
    ) -> Deck:
        # Get or create the deck that the shared deck will be cloned into
        try:
            # If the student is copying this deck from a teacher,
            # this is the classroom the deck is attached to
            attached_to_classroom = self.attached_to_classroom
        except SharedDeck.attached_to_classroom.RelatedObjectDoesNotExist:
            attached_to_classroom = None

        deck, created = Deck.objects.get_or_create(
            user=user,
            title=destination_deck_title or self.title,
            student_attached_to=attached_to_classroom,
        )

        if created:
            DeckStudySessionManager.objects.create(
                deck=deck,
                user=user.profile,
                scheduling_algorithm=options.get('scheduling_algorithm', 'ANKING'),
                shuffle_unseen_cards=options.get('shuffle_unseen_cards', False),
                daily_new_card_limit=options.get('daily_new_card_limit', 20),
            )

        # Add the deck into the destination decks list of shared decks
        SharedDeckRelation.objects.create(
            deck=deck,
            shared_deck=self,
            cloned_at_version=self.version_number,
        )

        DeckClone.objects.create(
            deck=self,
            profile=user.profile,
        )

        shared_flashcard_creators = self.flashcards.all().prefetch_related(
            'fields',
        )  # type: List[FlashCardCreator]

        creators = []
        flashcards = []
        fields = []
        for shared_flashcard_creator in shared_flashcard_creators:
            new_creator, new_flashcards, new_fields = shared_flashcard_creator.clone(deck)
            creators.append(new_creator)
            flashcards += new_flashcards
            fields += new_fields

        FlashCardCreator.objects.bulk_create(creators)
        FlashCard.objects.bulk_create(flashcards)
        FlashCardField.objects.bulk_create(fields)

        return deck

    def push_updates(
        self,
        origin_deck: Deck,
        check_diff_only: bool = False,
    ):
        diff = {'created': 0, 'modified': 0, 'deleted': 0}

        # Update the shared deck's flashcard creators
        origin_flashcard_creators = origin_deck.flashcards.prefetch_related(
            'fields',
            'shared_mirror',
        )  # type: List[FlashCardCreator]
        shared_creators_to_update = []  # type: List[FlashCardCreator]
        new_creators_to_create = []  # type: List[FlashCardCreator]
        new_fields_to_create = []  # type: List[FlashCardField]
        fields_to_update = []  # type: List[FlashCardField]
        creators_not_to_delete = []  # type: List[str]

        for origin_flashcard_creator in origin_flashcard_creators:
            try:
                shared_mirror = origin_flashcard_creator.\
                    shared_mirror  # type: FlashCardCreator
            except FlashCardCreator.DoesNotExist:
                shared_mirror = None

            if shared_mirror is None:
                if not check_diff_only:
                    new_creator, _, new_fields = origin_flashcard_creator.clone(
                        self,
                        origin_or_copied='ORIGIN',
                        skip_creating_review_instances=True,
                    )
                    new_creators_to_create.append(new_creator)
                    new_fields_to_create += new_fields
                    creators_not_to_delete.append(new_creator.pk)

                diff['created'] += 1
            else:
                creator, updated_fields, actual_difference = shared_mirror.update(
                    creator_to_get_updates_from=origin_flashcard_creator,
                    check_diff_only=check_diff_only,
                )
                creators_not_to_delete.append(creator.pk)

                if actual_difference:
                    diff['modified'] += 1
                    shared_creators_to_update.append(creator)
                    fields_to_update += updated_fields

        # Bulk create and update
        if not check_diff_only:
            FlashCardCreator.objects.bulk_create(new_creators_to_create)
            FlashCardField.objects.bulk_create(new_fields_to_create)
            FlashCardCreator.objects.bulk_update(
                shared_creators_to_update,
                ['tags', 'flashcard_num'],
            )
            FlashCardField.objects.bulk_update(
                fields_to_update,
                ['text'],
            )

        # Delete all flashcards that weren't updated
        shared_mirrors = FlashCardCreator.objects.filter(deck=self)
        not_updated = shared_mirrors.filter(~Q(pk__in=creators_not_to_delete))
        diff['deleted'] += not_updated.count()
        if not check_diff_only:
            not_updated.delete()

        if check_diff_only:
            return diff
        else:
            # Increment version number
            self.version_number += 1
            self.save()

            # # Create notification for everyone who's cloned this deck
            # profs_to_notify = Profile.objects.filter(
            #     user__decks__shared_deck_relations__shared_deck=self,
            # )

            # Notification.objects.bulk_create([
            #     Notification(
            #         title=f'Update for "{self.title}"',
            #         description=f'The creator of "{self.title}" has released a new update.  You can update your deck with "Other > Edit > Check For Updates > Update."',
            #         profile=profile,
            #     )
            #     for profile in profs_to_notify
            # ])

            return self

    def user_has_access(self, user: User) -> bool:
        return (
            user == self.user or
            self.sharing_setting == 'PUBLIC' or
            (not user.is_anonymous and (
                (self.sharing_setting == 'FRIENDS' and user in self.user.profile.friends.all()) or # user is friend
                (self.sharing_setting == 'STUDENT' and self.attached_to_classroom.students.filter(pk=user.profile.pk).exists()) # user is student
            ))
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
