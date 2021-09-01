from __future__ import \
    annotations  # TODO: remove this when we upgrade to python 3.10 (and Union and others)

import json
import re
import uuid
from collections import defaultdict
from typing import Dict, List, Literal, Tuple, Union

from django.apps import apps
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.aggregates import Avg
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from django.db.models.signals import post_save, pre_delete
from django.utils import timezone
from skill_tree.models import MainSection, SubSection
from utils import get_morning

User = settings.AUTH_USER_MODEL
FlashCardTypes = Literal['cloze', 'basic', 'reversed']
LearningStatusType = Literal['UNSEEN', 'LEARNING', 'LEARNED', 'RELEARNING']


class Deck(models.Model):
    # === BASIC INFO ===
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=128)

    # === SHARING ===
    equivalent_to_snapshot = models.ForeignKey(
        'sharing_system.SnapShot',
        on_delete=models.SET_NULL,
        related_name='decks_equivalent_to',
        null=True, blank=True,
    )

    # Since deck updates can take a few seconds, there is a lock on the update
    # condition of decks so that two updates aren't triggered at the same time
    is_updating = models.BooleanField(default=False)

    # === CLASSROOM ===
    # Specifies which classroom a student has attatched this deck to (if any)
    student_attached_to = models.ForeignKey(
        'teachers.Classroom',
        models.SET_NULL,
        related_name='attached_student_decks',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-id']

    def __str__(self) -> str:
        return str(self.title)

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

    def calc_percent_complete(self, flashcards: QuerySet[ReviewInstance] = None) -> float:
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
        blacklisted_tags: tuple = ('', 'essential'),  # don't include these tags
    ) -> dict:
        skill_tree = defaultdict(set)
        flashcards = self.flashcards.all()

        # NOTE: Doing a double pass, and using dict/set, ensures that we don't
        # have to check whether or not a tag is already in the skill tree

        # Make dictionary of skill tree
        for flashcard in flashcards:
            tags = flashcard.tags.split(', ')
            if tags[0] in blacklisted_tags:
                continue

            tag = tags[0]
            same_tag_flashcards = flashcards.filter(tags__startswith=tag)

            for same_tag_flashcard in same_tag_flashcards:
                sub_tags = same_tag_flashcard.tags.split(', ')
                if len(sub_tags) == 1 or sub_tags[1] in blacklisted_tags:
                    continue

                sub_tag = sub_tags[1]
                skill_tree[tag].add(sub_tag)

        # Turn dictionary object into MainSection and SubSection
        main_sections = []
        sub_sections = []
        for tag, sub_tags in skill_tree.items():
            main_section = MainSection(
                title=tag.capitalize(),
                tag=tag,
                deck=self,
            )
            main_sections.append(main_section)
            for sub_tag in sub_tags:
                sub_sections.append(SubSection(
                    title=sub_tag.capitalize(),
                    tag=sub_tag,
                    main_section=main_section,
                ))

        # Bulk create
        MainSection.objects.bulk_create(main_sections)
        SubSection.objects.bulk_create(sub_sections)

        return skill_tree


class FlashCard(models.Model):
    # === BASIC INFO ===
    flashcard_type = models.CharField(default='basic', max_length=16)  # TODO: capitalize
    flashcard_num = models.PositiveSmallIntegerField()  # zero-indexed

    # === CONTENT INFO ===
    fields = models.JSONField()  # list of two lists of Slate Nodes
    tags = models.CharField(default='', max_length=1024, blank=True)
    front_image = models.ImageField(upload_to='uploads/', null=True, blank=True)
    back_image = models.ImageField(upload_to='uploads/', null=True, blank=True)

    EDITABLE_ATTRS = ('fields', 'tags', 'front_image', 'back_image')

    # === OTHER ===
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    universal_flashcard_id = models.UUIDField(null=True, blank=True)  # for sharing

    class Meta:
        ordering = ['flashcard_num']

    def __str__(self) -> str:
        return f'Flashcard: {str(self.fields)[:50]}...'

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
    def search_tags(tags: str) -> Q:
        query = Q()

        separated_tags = [el.strip() for el in re.split('(AND)|(OR)', tags) if el is not None]
        i = 0
        while i < len(separated_tags):
            if separated_tags[i] in ('AND', 'OR'):
                i += 1
                continue

            contains_query = Q(tags__icontains=separated_tags[i])

            # Invert the query if it starts with NOT
            if separated_tags[i].startswith('NOT '):
                contains_query = ~Q(
                    tags__icontains=separated_tags[i].replace(
                        'NOT ', ''
                    )
                )

            # Decide how to merge the query, based on the previous value being AND or OR
            previous_operator = separated_tags[i - 1] if i > 0 else None
            if previous_operator == 'AND' or previous_operator is None:
                query &= contains_query
            elif previous_operator == 'OR':
                query |= contains_query
            else:
                raise ValueError('Invalid tags query')

            i += 1

        return query

    @staticmethod
    def get_max_flashcard_num(sub_section: SubSection) -> int:
        # Returns -1 if there are no flashcards in the deck
        flashcards = FlashCard.objects.filter(sub_sections=sub_section)
        max_fc_num_obj = flashcards.order_by('-flashcard_num').first()

        return max_fc_num_obj.flashcard_num if max_fc_num_obj is not None else -1

    @staticmethod
    def create_flashcard(
        sub_section: SubSection,
        tags: str,
        flashcard_type: FlashCardTypes,
        fields: List[list],
        flashcard_num: int = None,
        front_image: ContentFile = None,
        back_image: ContentFile = None,
        flashcard_uuid: uuid.uuid4 = None,
        universal_flashcard_id: uuid.uuid4 = None,
    ) -> Tuple[FlashCard, List[ReviewInstance]]:
        flashcard = FlashCard.objects.create(
            flashcard_type=flashcard_type,
            flashcard_num=(
                flashcard_num
                if flashcard_num is not None else
                FlashCard.get_max_flashcard_num(sub_section) + 1
            ),
            fields=fields,
            tags=tags,
            front_image=front_image,
            back_image=back_image,
            pk=flashcard_uuid,
            universal_flashcard_id=universal_flashcard_id,
        )
        sub_section.flashcards.add(flashcard)

        review_instances = ReviewInstance.create_review_instance(flashcard)
        ReviewInstance.objects.bulk_create(review_instances)

        return flashcard, review_instances

    def copy(
        self,
        skip_creating_review_instances: bool = False,
        universal_flashcard_id: uuid.uuid4 = None,
    ) -> Tuple[FlashCard, List[ReviewInstance]]:
        """
        Clones a full copy of a flashcard
        (returns--but also does not create--the flashcard's review instances)
        """
        new_flashcard = FlashCard(
            flashcard_num=self.flashcard_num,
            flashcard_type=self.flashcard_type,
            universal_flashcard_id=universal_flashcard_id,
            id=uuid.uuid4(),

            # Text
            fields=self.fields,
            tags=self.tags,
        )

        # Derive the review instances from the flashcard
        if not skip_creating_review_instances:
            new_review_instances = ReviewInstance.create_review_instance(new_flashcard)
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
            # TODO: rewrite this `self.sub_sections.first()`
            if self.flashcard_num == FlashCard.get_max_flashcard_num(self.sub_sections.first()):
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
    last_review = models.DateTimeField(null=True, blank=True)

    is_suspended = models.BooleanField(default=False)
    leech_index = models.PositiveSmallIntegerField(default=0)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        ordering = ['flashcard__flashcard_num']

    def __str__(self) -> str:
        return str(self.flashcard.fields)

    def is_leech(self) -> bool:
        return self.flashcard.has_tag('leech')

    @staticmethod
    def create_review_instance(flashcard: FlashCard) -> List[ReviewInstance]:
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

        all_content_indicies = CONTENT_INDICIES_DICT[flashcard.flashcard_type.upper()]

        # Create flashcard review instance
        if flashcard.flashcard_type == 'cloze':
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

    # TODO: cache this function
    @staticmethod
    def search_tags(tags: str) -> Q:
        return Q(
            flashcard__in=FlashCard.objects.filter(FlashCard.search_tags(tags)),
        )

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
    last_review = models.DateTimeField(null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Review instance histories'


# When a deck is created, create an example MainSection
def deck_saved(sender, instance, created, **kwargs):
    if created:
        if instance.equivalent_to_snapshot:
            return

        main_section = MainSection.objects.create(
            deck=instance,
            title='Default',
            description='''
Your flashcards are organized into different sections.
This is the default "main section", which you can edit to be your first topic ("Unit 1").
To create flashcards, click the "sub sections" below.
            ''',
        )
        MainSectionAction = apps.get_model('sharing_system.MainSectionAction')
        MainSectionAction.objects.create(
            deck=instance,
            main_section=main_section,
            action='CREATE',
        )


# When a main section is created, create an example SubSection
def main_section_saved(sender, instance, created, **kwargs):
    if created:
        sub_section = SubSection.objects.create(
            main_section=instance,
            title='Default',
            description='Edit this description by... TK TODO',
        )
        SubSectionAction = apps.get_model('sharing_system.SubSectionAction')
        SubSectionAction.objects.create(
            deck_id=instance.deck_id,
            sub_section=sub_section,
            action='CREATE',
        )


# When a deck is deleted, delete all its flashcards
def deck_deleted(sender, instance, using, **kwargs):
    FlashCard.objects.using(using).filter(
        sub_sections__main_section__deck_id=instance.pk,
    ).delete()


post_save.connect(deck_saved, sender=Deck)
post_save.connect(main_section_saved, sender=MainSection)
pre_delete.connect(deck_deleted, sender=Deck)
