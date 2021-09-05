from __future__ import annotations

import uuid
from typing import Tuple, Union

from django.apps import apps
from django.db import models
from django.db.models import Q
from django.utils import timezone
from utils import get_morning


class SectionData(models.Model):
    title = models.CharField(max_length=128)
    description = models.TextField(max_length=4096)
    EDITABLE_ATTRS = ('title', 'description')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)


class AbstractSectionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related('data')


# Abstract section that `MainSection` and `SubSection` inherit from
class AbstractSection(models.Model):
    # === BASIC INFO ===
    order_num = models.PositiveSmallIntegerField()  # zero-indexed, for sorting

    # === CACHES ===
    # Calculating percent complete is expensive, so we cache it
    # Cache is cleared when a flashcard is completed or when fetching and a day has passed
    cached_percent_complete = models.FloatField(null=True, blank=True)
    cached_percent_complete_time = models.DateTimeField(null=True, blank=True)

    # === OTHER ===
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
        ordering = ('order_num',)

    def __str__(self) -> str:
        return self.title

    def get_percent_complete(self) -> float:
        if (
            self.cached_percent_complete is not None and
            # And the day hasn't changed
            (
                self.cached_percent_complete == 0 or  # can't go below 0
                self.cached_percent_complete_time.day == timezone.now().day
            )
        ):
            return self.cached_percent_complete

        # Need this because of circular-import
        ReviewInstance = apps.get_model('decks', 'ReviewInstance')

        query = self.get_review_instance_query()
        total_num = ReviewInstance.objects.filter(query).count()
        query &= (
            ~Q(learning_status='UNSEEN')
            &
            Q(next_review__gt=get_morning())
        )  # learned flashcards that aren't due
        completed_num = ReviewInstance.objects.filter(query).count()

        percent_complete = round(completed_num / total_num, 2) if total_num else 0
        self.cached_percent_complete = percent_complete
        self.cached_percent_complete_time = timezone.now()

        return percent_complete

    @staticmethod
    def clean(title: str):
        return title.replace('-', ' ')

    @staticmethod
    def get_from_formatted_title(
        section_titles: str,
        deck_id: int,
    ) -> Tuple[Union[MainSection, SubSection], bool]:
        titles = section_titles.split('__')
        if len(titles) == 1:
            return MainSection.objects.get(
                deck_id=deck_id,
                title__iexact=AbstractSection.clean(titles[0]),
            ), True
        else:
            return SubSection.objects.get(
                main_section__deck_id=deck_id,
                main_section__data__title__iexact=AbstractSection.clean(titles[0]),
                data__title__iexact=AbstractSection.clean(titles[1]),
            ), False

    @staticmethod
    def get_query_from_formatted_title(
        section_titles: str,
        deck_id: int = None,
        shared_deck_id: int = None,
    ) -> Tuple[Q, bool]:
        if not section_titles:
            return Q(), None

        if deck_id:
            deck_query = Q(sub_section__main_section__deck_id=deck_id)
        elif shared_deck_id:
            deck_query = Q(sub_section__main_section__shared_deck_id=shared_deck_id)
        else:
            deck_query = Q()

        titles = section_titles.split('__')
        if len(titles) == 1:
            return deck_query & Q(
                sub_section__main_section__data__title__iexact=AbstractSection.clean(titles[0]),
            ), True
        else:
            return deck_query & Q(
                sub_section__main_section__deck_id=deck_id,
                sub_section__main_section__data__title__iexact=AbstractSection.clean(titles[0]),
                sub_section__data__title__iexact=AbstractSection.clean(titles[1]),
            ), False


class MainSection(AbstractSection):
    data = models.ForeignKey(
        SectionData,
        on_delete=models.CASCADE,
        related_name='main_sections',
    )

    deck = models.ForeignKey(
        'decks.Deck',
        related_name='main_sections',
        on_delete=models.CASCADE,
        null=True, blank=True,
    )
    snapshot = models.ForeignKey(
        'sharing_system.SnapShot',
        related_name='main_sections',
        on_delete=models.CASCADE,
        null=True, blank=True,
    )

    universal_main_section_id = models.UUIDField(null=True, blank=True)
    objects = AbstractSectionManager()

    def get_review_instance_query(self):
        return Q(flashcard__sub_section__main_section_id=self.pk)

    def copy(
        self,
        snapshot_id: str,
        create_new_data: bool = False,
    ) -> MainSection:
        if create_new_data:
            data = SectionData(
                title=self.title,
                description=self.description,
                pk=uuid.uuid4(),
            )
            data_id = data.pk
        else:
            data_id = self.data_id

        return MainSection(
            data_id=data_id,
            universal_main_section_id=self.universal_main_section_id,
            snapshot_id=snapshot_id,
            pk=uuid.uuid4(),
        )

    @staticmethod
    def get_max_order_num(deck) -> int:
        # Returns -1 if there are no main sections in the deck
        main_sections = MainSection.objects.filter(deck=deck)
        max_ms_num_obj = main_sections.order_by('order_num').last()

        return getattr(max_ms_num_obj, 'order_num', -1)

    def get_self_max_order_num(self) -> int:
        return MainSection.get_max_order_num(self.deck)


class SubSection(AbstractSection):
    data = models.ForeignKey(
        SectionData,
        on_delete=models.CASCADE,
        related_name='sub_sections',
    )
    main_section = models.ForeignKey(
        MainSection,
        on_delete=models.CASCADE,
        related_name='sub_sections',
    )

    universal_sub_section_id = models.UUIDField(null=True, blank=True)
    objects = AbstractSectionManager()

    def get_review_instance_query(self):
        return Q(flashcard__sub_section_id=self.pk)

    def copy(
        self,
        main_section_id: str,
        create_new_data: bool = True,
    ):
        if create_new_data:
            data = SectionData(
                title=self.title,
                description=self.description,
                pk=uuid.uuid4(),
            )
            data_id = data.pk
        else:
            data_id = self.data_id

        sub_section = SubSection(
            data_id=data_id,
            universal_sub_section_id=self.universal_sub_section_id,
            pk=uuid.uuid4(),

            main_section_id=main_section_id,
        )

        return sub_section

    @staticmethod
    def get_max_order_num(main_section: MainSection) -> int:
        # Returns -1 if there are no main sections in the deck
        sub_sections = SubSection.objects.filter(main_section=main_section)
        max_ss_num_obj = sub_sections.order_by('order_num').last()

        return getattr(max_ss_num_obj, 'order_num', -1)

    def get_self_max_order_num(self) -> int:
        return SubSection.get_max_order_num(self.main_section)
