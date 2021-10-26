from __future__ import \
    annotations  # TODO: remove this when we upgrade to python 3.10 (and Union and others)

import json
import os
import re
import uuid
from typing import Dict, List, Literal, Tuple, Union

from django.apps import apps
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.aggregates import Avg
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from django.db.models.signals import post_delete, post_save, pre_save
from django.utils import timezone
from skill_tree.models import MainSection, SectionData, SubSection
from utils import get_morning

User = settings.AUTH_USER_MODEL
FlashCardTypes = Literal['CLOZE', 'BASIC', 'REVERSED']
LearningStatusType = Literal['UNSEEN', 'LEARNING', 'LEARNED', 'RELEARNING']


class Deck(models.Model):
    # === BASIC INFO ===
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=128)
    is_archived = models.BooleanField(default=False)

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
        deck_query = Q(flashcard__sub_section__main_section__deck_id=self.pk)
        default = Q(is_suspended=False) & deck_query
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
            Q(is_suspended=True) & deck_query,
        )

        # Get other data
        avg_ease = ReviewInstance.objects.filter(
            ~Q(learning_status='UNSEEN') & deck_query,
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

    def is_updated(self) -> bool:
        return (
            not self.equivalent_to_snapshot_id
            or
            (
                self.equivalent_to_snapshot.shared_deck.get_latest_snapshot().pk
                ==
                self.equivalent_to_snapshot.pk
            )
        )


class FlashCardManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related('data')


class FlashCard(models.Model):
    data = models.ForeignKey(
        'decks.FlashCardData',
        on_delete=models.CASCADE,
        related_name='flashcards',
    )
    sub_section = models.ForeignKey(
        'skill_tree.SubSection',
        on_delete=models.CASCADE,
        related_name='flashcards',
    )

    FLASHCARD_TYPE_CHOICES = (
        ('BASIC', 'Basic'),
        ('REVERSED', 'Reversed'),
        ('CLOZE', 'Cloze'),
    )
    flashcard_type = models.CharField(
        default='BASIC',
        max_length=8,
        choices=FLASHCARD_TYPE_CHOICES,
    )
    order_num = models.PositiveSmallIntegerField()  # zero-indexed
    universal_flashcard_id = models.UUIDField(null=True, blank=True)  # for sharing

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objects = FlashCardManager()

    class Meta:
        ordering = ('order_num',)

    def __str__(self) -> str:
        return f'{self.flashcard_type}: {self.data.fields}'

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
    def get_max_order_num(sub_section_id: int) -> int:
        # Returns -1 if there are no flashcards in the sub section
        flashcards = FlashCard.objects.filter(sub_section_id=sub_section_id)
        max_fc_num_obj = flashcards.order_by('order_num').last()

        return getattr(max_fc_num_obj, 'order_num', -1)

    def get_self_max_order_num(self) -> int:
        return FlashCard.get_max_order_num(self.sub_section_id)

    @staticmethod
    def create(
        sub_section: SubSection,
        tags: str,
        flashcard_type: FlashCardTypes,
        fields: List[list],
        order_num: int = None,
        front_image: ContentFile = None,
        back_image: ContentFile = None,
        flashcard_uuid: uuid.uuid4 = None,
        data_uuid: uuid.uuid4 = None,
        universal_flashcard_id: uuid.uuid4 = None,
    ) -> Tuple[FlashCard, List[ReviewInstance]]:
        data = FlashCardData.objects.create(
            fields=fields,
            tags=tags,
            front_image=front_image,
            back_image=back_image,
            pk=data_uuid,
        )

        flashcard = FlashCard.objects.create(
            sub_section=sub_section,
            data=data,
            flashcard_type=flashcard_type,
            order_num=(
                order_num
                if order_num is not None else
                FlashCard.get_max_order_num(sub_section) + 1
            ),
            pk=flashcard_uuid,
            universal_flashcard_id=universal_flashcard_id,
        )

        review_instances = ReviewInstance.create_review_instance(flashcard)
        ReviewInstance.objects.bulk_create(review_instances)

        return flashcard, review_instances

    def copy(
        self,
        sub_section_id: int,
        skip_creating_review_instances: bool = False,
        universal_flashcard_id: uuid.uuid4 = None,
        create_new_data: bool = True,
    ) -> Tuple[FlashCardData, FlashCard, List[ReviewInstance]]:
        """
        Clones a full copy of a flashcard
        (returns--but also does not create--the flashcard's review instances)
        """
        if create_new_data:
            new_data = self.data.copy()
        else:
            new_data = self.data

        new_flashcard = FlashCard(
            data=new_data,
            sub_section_id=sub_section_id,
            order_num=self.order_num,
            flashcard_type=self.flashcard_type,
            universal_flashcard_id=universal_flashcard_id or self.universal_flashcard_id,
            id=uuid.uuid4(),
        )

        # Derive the review instances from the flashcard
        if not skip_creating_review_instances:
            new_review_instances = ReviewInstance.create_review_instance(new_flashcard)
        else:
            new_review_instances = None

        return new_data, new_flashcard, new_review_instances

    # TODO: delete
    def update(
        self,
        flashcard_to_get_updates_from: FlashCard,
        check_diff_only: bool = False,
    ) -> Tuple[FlashCard, bool]:
        # FIXME: this function does not work for cloze, when the number of RIs changes
        attrs_to_update = ['fields', 'tags', 'order_num']
        actual_difference = False

        for attr in attrs_to_update:
            updated_attr = getattr(flashcard_to_get_updates_from, attr)
            if getattr(self, attr) != updated_attr:
                actual_difference = True
                if not check_diff_only:
                    setattr(self, attr, updated_attr)

        return self, actual_difference


class FlashCardData(models.Model):
    fields = models.JSONField()  # list of two lists of Slate Nodes
    tags = models.CharField(default='', max_length=1024, blank=True)
    front_image = models.ImageField(upload_to='uploads/', null=True, blank=True)
    back_image = models.ImageField(upload_to='uploads/', null=True, blank=True)

    EDITABLE_ATTRS = ('fields', 'tags', 'front_image', 'back_image')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self) -> str:
        return str(self.fields)

    def copy(self) -> FlashCardData:
        new_data = FlashCardData(
            fields=self.fields,
            tags=self.tags,
            id=uuid.uuid4(),
        )

        if self.front_image:
            new_data.front_image = ContentFile(
                self.front_image.read(),
                name=f'{new_data.pk}-front',
            )

        if self.back_image:
            new_data.back_image = ContentFile(
                self.back_image.read(),
                name=f'{new_data.pk}-back',
            )

        return new_data

    def pull(self, other: FlashCardData, save: bool = False) -> FlashCardData:
        for attr in FlashCardData.EDITABLE_ATTRS:
            setattr(self, attr, getattr(other, attr))

        if save:
            self.save()

        return self

    def has_view_access(self, profile_id: int) -> bool:
        flashcards = self.flashcards.prefetch_related(
            'sub_section__main_section__snapshot__shared_deck',
        ).all()
        return any(
            flashcard.sub_section.main_section.snapshot.shared_deck.has_view_access(profile_id)
            for flashcard in flashcards
            if flashcard.sub_section.main_section.snapshot
        )

    def has_edit_access(self, profile_id: int) -> bool:
        flashcards = self.flashcards.prefetch_related(
            'sub_section__main_section__snapshot__shared_deck',
        ).all()
        return any(
            flashcard.sub_section.main_section.snapshot.shared_deck.has_edit_access(profile_id)
            if flashcard.sub_section.main_section.snapshot else
            flashcard.sub_section.main_section.deck.user.profile.pk == profile_id

            for flashcard in flashcards
        )


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


class ReviewInstanceManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related('flashcard__data')


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
    objects = ReviewInstanceManager()

    class Meta:
        ordering = ['flashcard__order_num']

    def __str__(self) -> str:
        return str(self.flashcard.data.fields)

    def is_leech(self) -> bool:
        return self.flashcard.has_tag('leech')

    @staticmethod
    def create_review_instance(flashcard: FlashCard) -> List[ReviewInstance]:
        """
        Function for creating flashcard review instances, given a flashcard
            type, flashcard, and text for cloze

        `flashcard_type`: Type of the flashcard to create
            (e.g., 'CLOZE', 'BASIC', 'REVERSED')
        `flashcard`: FlashCard object that will house this flashcard
            review instance
        `field`: Only needed for cloze flashcards, provides the text to parse
            with regex to get cloze instances
        """
        # Get background information
        this_morning = get_morning()

        all_content_indicies = CONTENT_INDICIES_DICT[flashcard.flashcard_type.upper()]

        # Create flashcard review instance
        if flashcard.flashcard_type == 'CLOZE':
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
                    r"{{c\d*::.*?}}", json.dumps(flashcard.data.fields[0]), re.MULTILINE
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

        data = SectionData.objects.create(
            title='Default',
            description=SectionData.DEFAULT_MAIN_SECTION_DESC,
        )
        main_section = MainSection.objects.create(
            deck=instance,
            data=data,
            order_num=MainSection.get_max_order_num(deck=instance) + 1,
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
        data = SectionData.objects.create(
            title='Default',
            description='Sub sections allow you to organize your deck into sub units',
        )
        sub_section = SubSection.objects.create(
            main_section=instance,
            data=data,
            order_num=SubSection.get_max_order_num(main_section=instance) + 1,
        )
        SubSectionAction = apps.get_model('sharing_system.SubSectionAction')
        SubSectionAction.objects.create(
            deck_id=instance.deck_id,
            sub_section=sub_section,
            action='CREATE',
        )


# Adapted from https://stackoverflow.com/a/16041527/10226703
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `FlashCardData` object is deleted.
    """
    if instance.front_image:
        if os.path.isfile(instance.front_image.path):
            os.remove(instance.front_image.path)

    if instance.back_image:
        if os.path.isfile(instance.back_image.path):
            os.remove(instance.back_image.path)


# Adapted from https://stackoverflow.com/a/16041527/10226703
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `FlashCardData` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        fc_data = FlashCardData.objects.get(pk=instance.pk)
    except FlashCardData.DoesNotExist:
        return False

    old_front_image = fc_data.front_image
    new_front_image = instance.front_image
    if (
        old_front_image and
        old_front_image != new_front_image and
        os.path.isfile(old_front_image.path)
    ):
        os.remove(old_front_image.path)

    old_back_image = fc_data.back_image
    new_back_image = instance.back_image
    if (
        old_back_image and
        old_back_image != new_back_image and
        os.path.isfile(old_back_image.path)
    ):
        os.remove(old_back_image.path)


post_save.connect(deck_saved, sender=Deck)
post_save.connect(main_section_saved, sender=MainSection)
post_delete.connect(auto_delete_file_on_delete, sender=FlashCardData)
pre_save.connect(auto_delete_file_on_change, sender=FlashCardData)
