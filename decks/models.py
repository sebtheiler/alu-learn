from __future__ import \
    annotations  # TODO: remove this when we upgrade to python 3.10 (and Union and others)

import datetime as dt
import json
import random
import re
import uuid
from itertools import chain
from typing import Dict, List, Literal, Tuple, Union

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.aggregates import Avg
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from django.db.models.signals import post_save, pre_delete
from django.utils import timezone
from profiles.models import Profile
from utils import get_morning

User = settings.AUTH_USER_MODEL
FlashCardTypes = Literal['cloze', 'basic', 'reversed']
LearningStatusType = Literal['UNSEEN', 'LEARNING', 'LEARNED', 'RELEARNING']


class DeckManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('user')


class Deck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=128)
    deck_type = models.CharField(default='standard', max_length=12)
    skill_tree = models.JSONField(null=True, default=None)

    # Note that although this allows for multiple creators, it is currently only using one
    # Also note that this specifies the shared deck this deck creates, not the one it
    # is cloned from
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
        description: str = '',
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

        # Clone flashcards
        flashcards = self.flashcards.prefetch_related('review_instances')
        flashcards_to_create = []

        for flashcard in flashcards:
            if flashcard.copied_from_creator and not include_copied_flashcards:
                # By default, this stops flashcards copied from another deck from
                # being re-published
                continue

            # Clone flashcard
            shared_flashcard = FlashCard(
                deck=shared_deck,
                flashcard_type=flashcard.flashcard_type,
                flashcard_num=flashcard.flashcard_num,
                origin_creator=flashcard,
                # Text info
                fields=flashcard.fields,
                tags=flashcard.tags,
            )
            flashcards_to_create.append(shared_flashcard)

        FlashCard.objects.bulk_create(flashcards_to_create)

        return shared_deck

    def user_has_access(self, user: User) -> bool:
        # For redundancy with `SharedDeck`
        return self.user == user

    def get_statistics(self) -> Dict:
        # Get various flashcard types (only counts are used)
        default = Q(is_suspended=False, flashcard__deck=self)
        unseen_flashcards = ReviewInstance.objects.filter(
            Q(learning_status='UNSEEN') & default,
        )
        learning_flashcards = ReviewInstance.objects.filter(
            Q(learning_status='LEARNING') & default,
        )
        learned_flashcards = ReviewInstance.objects.filter(
            Q(learning_status='LEARNED') & default,
        )
        relearning_flashcards = ReviewInstance.objects.filter(
            Q(learning_status='RELEARNING') & default,
        )
        suspended_flashcards = ReviewInstance.objects.filter(
            is_suspended=True, flashcard__deck=self,
        )

        # Get other data
        avg_ease = ReviewInstance.objects.filter(
            ~Q(learning_status='UNSEEN') & Q(flashcard__deck=self)
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

        local_flashcards = FlashCard.objects.filter(
            deck=self,
            copied_from_deck=shared_deck,
        )  # type: List[FlashCard]
        shared_flashcards = shared_deck.flashcards.all()

        flashcards_to_create = []  # type: List[FlashCard]
        flashcards_to_update = []  # type: List[FlashCard]
        flashcard_ids_not_to_delete = []  # type: List[str]
        review_instances_to_create = []  # type: List[ReviewInstance]
        for shared_flashcard in shared_flashcards:
            try:
                local_flashcard = local_flashcards.get(
                    copied_from_creator=shared_flashcard,
                )  # type: FlashCard
            except FlashCard.DoesNotExist:
                local_flashcard = None

            if local_flashcard is None:
                new_flashcards, new_review_instances = shared_flashcard.clone(
                    self,
                )
                flashcards_to_create.append(new_flashcards)
                flashcard_ids_not_to_delete.append(new_flashcards.pk)
                review_instances_to_create += new_review_instances
            else:
                # Update existing flashcards
                flashcard, _ = local_flashcard.update(
                    flashcard_to_get_updates_from=shared_flashcard,
                )
                flashcards_to_update.append(flashcard)
                flashcard_ids_not_to_delete.append(flashcard.pk)

        # Create all flashcard review instances
        FlashCard.objects.bulk_create(flashcards_to_create)
        ReviewInstance.objects.bulk_create(review_instances_to_create)
        FlashCard.objects.bulk_update(
            flashcards_to_update,
            ['tags', 'flashcard_num'],
        )

        # Delete all flashcards that weren't updated
        not_updated = local_flashcards.filter(~Q(pk__in=flashcard_ids_not_to_delete))
        not_updated.delete()

        # Bump version number and return
        shared_deck_relation = self.shared_deck_relations.get(shared_deck=shared_deck)
        shared_deck_relation.cloned_at_version = shared_deck.version_number
        shared_deck_relation.save()

        self.is_updating = False
        self.save()

        return self

    def calc_percent_complete(self, flashcards: QuerySet[ReviewInstance] = None) -> float:
        # TODO: Cache this
        if flashcards is None:
            flashcards = ReviewInstance.objects.filter(flashcard__deck=self)
        else:
            flashcards = flashcards.filter(flashcard__deck=self)
        total_flashcard_num = flashcards.count()
        unseen_flashcard_num = flashcards.filter(learning_status='UNSEEN').count()

        try:
            return (total_flashcard_num - unseen_flashcard_num) / total_flashcard_num
        except ZeroDivisionError:
            return 0

    def list_available_updates(self) -> List[dict]:
        needs_updating = []
        for shared_deck_relation in self.shared_deck_relations.all()\
                .prefetch_related('shared_deck'):
            if (
                shared_deck_relation.cloned_at_version
                <
                shared_deck_relation.shared_deck.version_number
            ):
                needs_updating.append({
                    'title': shared_deck_relation.shared_deck.title,
                    'id': shared_deck_relation.shared_deck.id,
                })

        return needs_updating

    def generate_skill_tree(
        self,
        max_depth: int = 3,  # how many layers deep to go (1-5)
        sort: bool = False,  # whether or not to sort the final tree alphabetically
        # TODO: fix `remove_essential`
        remove_essential: bool = False  # whether or not to remove the `essential` tag
    ) -> dict:
        if max_depth < 1 or max_depth > 5:
            raise ValueError('`max_depth` must be between 1 and 5')

        skill_tree = {}
        flashcards = self.flashcards.all()

        # Make dictionary of top tags, each mapping to an empty dict
        for creator in flashcards:
            creator_tags = creator.tags.split(', ')
            if len(creator_tags) == 0:
                continue

            tag = creator_tags[0]
            if tag != 'essential' or not remove_essential:
                skill_tree[tag] = {}

        def recursive_layer(skill_tree_branch, depth=0):
            if depth >= max_depth - 1:
                return

            for tag in skill_tree_branch.keys():
                # Find cards with the same top level tag
                had_tags = False
                # TODO: this also triggers if the tag is lower down
                # same_tag_cards = flashcards.filter(tags__icontains=tag)
                same_tag_cards = flashcards.filter(tags__icontains=tag)
                for same_tag_card in same_tag_cards:
                    same_tag_card_tags = same_tag_card.tags.split(', ')[depth + 1:]
                    if len(same_tag_card_tags) == 0:
                        continue

                    same_tag_card_tag = same_tag_card_tags[0]
                    if same_tag_card_tag != 'essential' or not remove_essential:
                        skill_tree_branch[tag][same_tag_card_tag] = {}
                    had_tags = True

                if had_tags:
                    recursive_layer(skill_tree_branch[tag], depth + 1)

        recursive_layer(skill_tree)

        if sort:
            skill_tree = dict(sorted(
                skill_tree.items(),
                key=lambda x: x[0],
                reverse=True,
            ))

        return skill_tree


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


class FlashCardManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('deck')


class FlashCard(models.Model):
    # === BASIC INFO ===
    deck = models.ForeignKey(
        Deck,
        on_delete=models.CASCADE,
        related_name='flashcards',
    )  # type: Deck
    flashcard_type = models.CharField(default='basic', max_length=16)
    flashcard_num = models.PositiveSmallIntegerField()  # zero-indexed

    # === TEXT INFO ===
    fields = models.JSONField()  # list of two lists of Slate Nodes
    tags = models.CharField(default='', max_length=1024, blank=True)

    # === SHARING INFO ===
    # Used when creating a shared deck
    origin_creator = models.OneToOneField(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        related_name='shared_mirror',
    )
    # This is used when cloning decks, to remember where the cloned flashcard came from
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
    )  # type: FlashCard

    # === OTHER ===

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objects = FlashCardManager()

    class Meta:
        ordering = ['flashcard_num']

    def __str__(self) -> str:
        return f'Flashcard in {self.deck.title} by @{self.deck.user.username}'

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
    def get_max_flashcard_num(deck: Deck) -> int:
        # Returns -1 if there are no flashcards in the deck
        flashcards = FlashCard.objects.filter(deck=deck)
        max_fc_num_obj = flashcards.order_by('-flashcard_num').first()

        return max_fc_num_obj.flashcard_num if max_fc_num_obj else -1

    @staticmethod
    def create_flashcard(
        deck: Deck,
        tags: str,
        flashcard_type: FlashCardTypes,
        fields: List[list],
    ) -> List[ReviewInstance]:
        flashcard = FlashCard.objects.create(
            deck=deck,
            flashcard_type=flashcard_type,
            flashcard_num=FlashCard.get_max_flashcard_num(deck) + 1,
            fields=fields,
            tags=tags,
        )

        flashcards = ReviewInstance.create_review_instance(
            flashcard_type,
            flashcard,
        )
        ReviewInstance.objects.bulk_create(flashcards)

        return flashcards

    def clone(
        self,
        new_deck: Deck = None,
        origin_or_copied: Literal['COPIED', 'ORIGIN'] = 'COPIED',
        skip_creating_review_instances: bool = False,
    ) -> Tuple[FlashCard, List[ReviewInstance]]:
        """
        Clones and saves a full copy of a flashcard
        (returns--but does not create--the flashcard's review instances)
        """
        new_flashcard = FlashCard(
            deck=new_deck or self.deck,
            flashcard_num=self.flashcard_num,
            flashcard_type=self.flashcard_type,
            id=uuid.uuid4(),
            # Text
            fields=self.fields,
            tags=self.tags,
        )

        if origin_or_copied == 'COPIED':
            new_flashcard.origin_creator = None
            new_flashcard.copied_from_creator = self
            new_flashcard.copied_from_deck = self.deck
        elif origin_or_copied == 'ORIGIN':
            new_flashcard.origin_creator = self
            new_flashcard.copied_from_creator = None
        else:
            raise ValueError('Invlaid value for `origin_or_copied`')

        # Derive the review instances from the flashcard
        if not skip_creating_review_instances:
            new_review_instances = ReviewInstance.create_review_instance(
                new_flashcard.flashcard_type,
                new_flashcard,
            )
        else:
            new_review_instances = None

        return new_flashcard, new_review_instances

    def update(
        self,
        flashcard_to_get_updates_from: FlashCard,
        check_diff_only: bool = False,
    ) -> Tuple[FlashCard, bool]:
        # FIXME: this function does not work for cloze, when the number of RIs changes
        attrs_to_update = ['fields', 'tags', 'flashcard_num']
        actual_difference = False

        for attr in attrs_to_update:
            updated_attr = getattr(flashcard_to_get_updates_from, attr)
            if getattr(self, attr) != updated_attr:
                actual_difference = True
                if not check_diff_only:
                    setattr(self, attr, updated_attr)

        return self, actual_difference

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

            FlashCard.objects.bulk_update([self, above_flashcard], ['flashcard_num'])
        elif rearrange_type == 'DOWN':
            if self.flashcard_num == FlashCard.get_max_flashcard_num(self.deck):
                return 'Flashcard already at bottom'

            below_flashcard = self.deck.flashcards.get(
                flashcard_num=self.flashcard_num + 1
            )
            below_flashcard.flashcard_num -= 1
            self.flashcard_num += 1

            FlashCard.objects.bulk_update([self, below_flashcard], ['flashcard_num'])
        else:
            return 'Invalid `rearrange_type`'


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


class ReviewInstance(models.Model):
    flashcard = models.ForeignKey(
        FlashCard,
        on_delete=models.CASCADE,
        related_name='review_instances',
    )  # type: FlashCard
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
    last_review = models.DateTimeField()

    is_suspended = models.BooleanField(default=False)
    leech_index = models.PositiveSmallIntegerField(default=0)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        ordering = ['flashcard__flashcard_num']

    def __str__(self) -> str:
        return str(self.flashcard.fields)

    def is_leech(self) -> bool:
        return self.flashcard.has_tag('leech')

    def set_is_leech(self, is_leech: bool, save: bool = True) -> str:
        # TODO: turn leech into a bool attr instead of tag
        flashcard = self.flashcard
        if is_leech:
            flashcard.add_tag('leech', save)
        else:
            flashcard.remove_tag('leech', save)

        return flashcard.tags

    @staticmethod
    def create_review_instance(
        flashcard_type: FlashCardTypes,
        flashcard: FlashCard,
    ) -> List[ReviewInstance]:
        """
        Function for creating flashcard review instances, given a flashcard
            type, flashcard, and text for cloze

        `flashcard_type`: Type of the flashcard to create
            (e.g., 'cloze', 'basic', 'reversed')
        `flashcard`: FlashCard object that will house this flashcard
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

                return ReviewInstance(
                    flashcard=flashcard,
                    next_review=this_morning,
                    content_indicies=[0],
                    name=f'cloze-{cloze_id}'
                )

            return [
                cloze_flashcard(match)
                for match in re.finditer(
                    r"{{c\d*::.*?}}", json.dumps(flashcard.fields[0]), re.MULTILINE
                ) if int(match.group().split("::")[0][3:]) not in cloze_ids
            ]
        else:
            # Create a flashcard for each field
            return [
                ReviewInstance(
                    flashcard=flashcard,
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
            contains_query = Q(flashcard__tags__icontains=separated_tags[i])

            # Invert the query if it starts with NOT
            if separated_tags[i].startswith('NOT '):
                contains_query = ~Q(
                    flashcard__tags__icontains=separated_tags[i].replace(
                        'NOT ', ''
                    )
                )

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
    ) -> Union[Q, QuerySet[ReviewInstance]]:
        # Search flashcards
        # We will be ANDing (&=) a bunch more queries to this
        # and using it as a filter in the end.
        flashcard_query = Q(flashcard__deck__user__pk=user.pk)

        # Filter by deck Id
        if deck_ids:
            flashcard_query &= Q(flashcard__deck__pk__in=deck_ids.split(','))

        # Filter by tags (and leech)
        # Note: using __icontains is not perfect, since it would have "car" appear in "carpet"
        if tags or leech is not None:
            tag_query = Q()
            if tags:
                tag_query &= ReviewInstance.search_tags(tags)

            # Also filter by leech, since it's a tag
            if str(leech).lower() == 'true' or (isinstance(leech, bool) and leech):
                tag_query &= Q(flashcard__tags__icontains='leech')
            elif str(leech).lower() == 'false' or (isinstance(leech, bool) and not leech):
                tag_query &= ~Q(flashcard__tags__icontains='leech')

            flashcard_query &= tag_query

        # Filter by contains
        if contains:
            flashcard_query &= Q(flashcard__fields__text__icontains=contains)

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
            return ReviewInstance.objects \
                .filter(flashcard_query) \
                .prefetch_related('flashcard') \
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

        # TODO: despite the comment, this is definitely getting flashcards from tomorrow
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
        seen_flashcards: QuerySet[ReviewInstance],
        unseen_flashcards: QuerySet[ReviewInstance],
        from_overflow_bucket: bool = False,
    ) -> QuerySet[ReviewInstance]:
        # Split the seen flashcards into recently due flashcards,
        # and old flashcards for the Overflow Bucket
        # TODO: 1 query
        recent_cutoff = timezone.now() - dt.timedelta(days=1, hours=2)
        overflow_bucket_cards = seen_flashcards.filter(
            next_review__lt=recent_cutoff,
        )
        if from_overflow_bucket:
            return {'flashcards': overflow_bucket_cards, 'num_overflow': None}

        recently_due = seen_flashcards.filter(
            next_review__gte=recent_cutoff,
        )

        # Get the earliest seen flashcards under the limit
        seen_flashcard_count = max(self.daily_seen_card_limit - self.seen_cards_done_today, 0)
        seen_flashcards = recently_due.order_by(
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

        return {
            'flashcards': flashcards,
            'num_overflow': overflow_bucket_cards.count() if not from_overflow_bucket else None,
        }


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

    def get_flashcards(self) -> Tuple[QuerySet[ReviewInstance], QuerySet[ReviewInstance]]:
        review_cutoff = self.calc_review_cutoff()

        ssm_flashcards = ReviewInstance.objects.filter(
            flashcard__deck__pk=self.deck.pk
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

    def generate_query(self, review_cutoff: dt.date = None) -> Q:
        return ReviewInstance.search_flashcards(
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
            return_query_only=True,
        )

    def get_flashcards(self) -> Tuple[QuerySet[ReviewInstance], QuerySet[ReviewInstance]]:
        review_cutoff = self.calc_review_cutoff()
        searched_flashcards = ReviewInstance.objects.filter(self.generate_query(review_cutoff))

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

        shared_flashcards = self.flashcards.all()

        flashcards = []
        review_instances = []
        for shared_flashcard in shared_flashcards:
            new_flashcards, new_review_instances = shared_flashcard.clone(deck)
            flashcards.append(new_flashcards)
            review_instances += new_review_instances

        FlashCard.objects.bulk_create(flashcards)
        ReviewInstance.objects.bulk_create(review_instances)

        return deck

    def push_updates(
        self,
        origin_deck: Deck,
        check_diff_only: bool = False,
    ):
        diff = {'created': 0, 'modified': 0, 'deleted': 0}

        # Update the shared deck's flashcards
        origin_flashcards = origin_deck.flashcards.prefetch_related(
            'shared_mirror',
        )  # type: List[FlashCard]
        shared_flashcards_to_update = []  # type: List[FlashCard]
        new_flashcards_to_create = []  # type: List[FlashCard]
        flashcard_ids_not_to_delete = []  # type: List[str]

        for origin_flashcard in origin_flashcards:
            try:
                shared_mirror = origin_flashcard.shared_mirror
            except FlashCard.DoesNotExist:
                shared_mirror = None

            if shared_mirror is None:
                if not check_diff_only:
                    new_flashcard, _ = origin_flashcard.clone(
                        self,
                        origin_or_copied='ORIGIN',
                        skip_creating_review_instances=True,
                    )
                    new_flashcards_to_create.append(new_flashcard)
                    flashcard_ids_not_to_delete.append(new_flashcard.pk)

                diff['created'] += 1
            else:
                flashcard, actual_difference = shared_mirror.update(
                    flashcard_to_get_updates_from=origin_flashcard,
                    check_diff_only=check_diff_only,
                )
                flashcard_ids_not_to_delete.append(flashcard.pk)

                if actual_difference:
                    diff['modified'] += 1
                    shared_flashcards_to_update.append(flashcard)

        # Bulk create and update
        if not check_diff_only:
            FlashCard.objects.bulk_create(new_flashcards_to_create)
            FlashCard.objects.bulk_update(
                shared_flashcards_to_update,
                ['fields', 'tags', 'flashcard_num'],
            )

        # Delete all flashcards that weren't updated
        shared_mirrors = FlashCard.objects.filter(deck=self)
        not_updated = shared_mirrors.filter(~Q(pk__in=flashcard_ids_not_to_delete))
        diff['deleted'] += not_updated.count()
        if not check_diff_only:
            not_updated.delete()

        if check_diff_only:
            return diff
        else:
            # Increment version number
            self.version_number += 1
            self.save()

            return self

    def user_has_access(self, user: User) -> bool:
        return (
            user == self.user or
            self.sharing_setting == 'PUBLIC' or
            (not user.is_anonymous and (
                (  # user is friend
                    self.sharing_setting == 'FRIENDS' and
                    user in self.user.profile.friends.all()
                ) or
                (  # user is student
                    self.sharing_setting == 'STUDENT' and
                    self.attached_to_classroom.students.filter(
                        pk=user.profile.pk,
                    ).exists()
                )
            ))
        )


class DeckClone(models.Model):
    deck = models.ForeignKey(SharedDeck, on_delete=models.CASCADE, related_name='clones')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='clones')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'Clone from @{self.profile.user.username} for Deck #{self.deck.id}'


class ReviewInstanceHistory(models.Model):
    review_instance = models.ForeignKey(
        ReviewInstance,
        on_delete=models.SET_NULL,
        related_name='history',
        null=True,
        blank=True,
    )

    # If the review instance foreign key is deleted, this stores a backup
    # of its ID to link together all similar history objects
    review_instance_backup_id = models.UUIDField(
        null=True,
        blank=True,
        default=None,
    )

    # Study information
    RESPONSE_CHOICES = [
        ('AGAIN', 'Again'),
        ('HARD', 'Hard'),
        ('GOOD', 'Good'),
        ('EASY', 'Easy'),
    ]
    grade_response = models.CharField(
        max_length=8,
        choices=RESPONSE_CHOICES,
    )
    time_taken = models.PositiveIntegerField()
    ease = models.PositiveSmallIntegerField()
    learning_status = models.CharField(
        max_length=10,
        choices=ReviewInstance.LEARNING_STATUS_CHOICES,
    )
    steps_index = models.PositiveSmallIntegerField(default=0)
    next_review = models.DateTimeField()
    last_review = models.DateTimeField()

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Review instance histories'


# When a deck is created, create it's DSSM
def deck_saved(sender, instance, created, _, using, *args, **kwargs):
    if created:
        DeckStudySessionManager.objects.using(using).create(
            deck=instance,
            user=instance.user.profile,
        )


# When a review instance is deleted, backup its ID in its history objs
def review_instance_deleted(sender, instance, using, **kwargs):
    ReviewInstanceHistory.objects.using(using).filter(
        review_instance=instance,
    ).update(
        review_instance_backup_id=instance.pk,
    )


post_save.connect(deck_saved, sender=Deck)
pre_delete.connect(review_instance_deleted, sender=ReviewInstance)
