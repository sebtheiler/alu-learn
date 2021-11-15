from __future__ import annotations

import uuid
from typing import Tuple, Union

from django.apps import apps
from django.core.cache import cache
from django.db import models
from django.db.models import Q
from utils import get_morning


class SectionData(models.Model):
    title = models.CharField(max_length=128)
    description = models.TextField(max_length=4096)
    EDITABLE_ATTRS = ('title', 'description')

    DEFAULT_MAIN_SECTION_DESC = '''
Your flashcards are organized into different sections.
This is the default "main section", which you can edit to be your first topic ("Unit 1").
To create flashcards, click the "sub sections" below.
    '''

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self) -> str:
        return self.title

    def pull(self, other: SectionData, save: bool = False) -> SectionData:
        for attr in SectionData.EDITABLE_ATTRS:
            setattr(self, attr, getattr(other, attr))

        if save:
            self.save()

        return self

    def has_view_access(self, profile_id: int) -> bool:
        return any(
            sub_section.main_section.snapshot.shared_deck.has_view_access(profile_id)
            if sub_section.main_section.snapshot else
            sub_section.main_section.deck.user.profile.pk == profile_id

            for sub_section in self.sub_sections.prefetch_related('main_section__shared_deck')
        ) or any(
            main_section.snapshot.shared_deck.has_view_access(profile_id)
            if main_section.snapshot else
            main_section.deck.user.profile.pk == profile_id

            for main_section in self.main_sections.prefetch_related('shared_deck')
        )

    def has_edit_access(self, profile_id: int) -> bool:
        return any(
            sub_section.main_section.snapshot.shared_deck.has_edit_access(profile_id)
            if sub_section.main_section.snapshot else
            sub_section.main_section.deck.user.profile.pk == profile_id

            for sub_section in self.sub_sections.prefetch_related('main_section__shared_deck')
        ) or any(
            main_section.snapshot.shared_deck.has_edit_access(profile_id)
            if main_section.snapshot else
            main_section.deck.user.profile.pk == profile_id

            for main_section in self.main_sections.prefetch_related('shared_deck')
        )


class AbstractSectionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related('data')


# Abstract section that `MainSection` and `SubSection` inherit from
class AbstractSection(models.Model):
    # === BASIC INFO ===
    order_num = models.PositiveSmallIntegerField()  # zero-indexed, for sorting

    # === OTHER ===
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
        ordering = ('order_num',)

    def __str__(self) -> str:
        return self.data.title

    def gen_cache_key(self, total=False):
        return (
            f'section_total_percent_complete__{self.pk}'
            if total else
            f'section_percent_complete__{self.pk}'
        )

    def clear_cache(self):
        cache.delete(self.gen_cache_key(False))
        cache.delete(self.gen_cache_key(True))

    def get_percent_complete(
        self,
        total: bool = False,
        utc_timezone_offset: int = 0,
    ) -> float:
        cache_key = self.gen_cache_key(total)
        if total and (total_percent_complete := cache.get(cache_key)):
            return total_percent_complete
        elif percent_complete := cache.get(cache_key):
            return percent_complete

        # Need this because of circular-import
        ReviewInstance = apps.get_model('decks', 'ReviewInstance')

        query = self.get_review_instance_query()
        total_num = ReviewInstance.objects.filter(query).count()
        query &= ~Q(learning_status='UNSEEN')
        if not total:
            query &= Q(next_review__gt=get_morning(utc_timezone_offset))
        completed_num = ReviewInstance.objects.filter(query).count()

        percent_complete = round(completed_num / total_num, 2) if total_num else 0
        cache.set(cache_key, percent_complete, 60*60*12)

        return percent_complete

    @staticmethod
    def clean(title: str):
        return title.replace('-', ' ').replace('.d.', '-')

    @staticmethod
    def get_from_formatted_title(
        section_titles: str,
        deck_id: int,
    ) -> Tuple[Union[MainSection, SubSection], bool]:
        titles = section_titles.split('__')
        if len(titles) == 0:
            raise MainSection.DoesNotExist
        elif len(titles) == 1:
            return MainSection.objects.get(
                deck_id=deck_id,
                data__title__iexact=AbstractSection.clean(titles[0]),
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

    @staticmethod
    def create(
        title: str,
        description: str,
        deck=None,
        snapshot=None,
        order_num: int = None,
        universal_main_section_id: str = None,
    ) -> Tuple[SectionData, MainSection]:
        from sharing_system.models import MainSectionAction  # avoid circular import

        data_id = uuid.uuid4()
        data = SectionData.objects.create(
            title=title,
            description=description,
            pk=data_id,
        )
        main_section = MainSection.objects.create(
            deck=deck,
            snapshot=snapshot,
            data_id=data_id,
            order_num=(
                order_num
                if order_num is not None else
                MainSection.get_max_order_num(deck) + 1
            ),
            universal_main_section_id=universal_main_section_id,
        )
        MainSectionAction.create_action('CREATE', main_section)

        return data, main_section

    def copy(
        self,
        snapshot_id: str = None,
        deck_id: int = None,
        create_new_data: bool = False,
        universal_main_section_id: str = None
    ) -> Tuple[SectionData, MainSection]:
        if create_new_data:
            data = SectionData(
                title=self.data.title,
                description=self.data.description,
                pk=uuid.uuid4(),
            )
        else:
            data = self.data

        return data, MainSection(
            snapshot_id=snapshot_id,
            deck_id=deck_id,
            data_id=data.pk,
            order_num=self.order_num,
            universal_main_section_id=universal_main_section_id or self.universal_main_section_id,
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

    @staticmethod
    def create(
        title: str,
        description: str,
        main_section: MainSection,
        order_num: int = None,
        universal_sub_section_id: str = None,
    ) -> Tuple[SectionData, SubSection]:
        from sharing_system.models import SubSectionAction

        data = SectionData.objects.create(
            title=title,
            description=description,
        )
        sub_section = SubSection.objects.create(
            data_id=data.pk,
            main_section_id=main_section.pk,
            order_num=(
                order_num
                if order_num is not None else
                SubSection.get_max_order_num(main_section) + 1
            ),
            universal_sub_section_id=universal_sub_section_id,
        )
        SubSectionAction.create_action('CREATE', sub_section)

        return data, sub_section

    def copy(
        self,
        main_section_id: str,
        universal_sub_section_id: str = None,
        create_new_data: bool = False,
    ) -> Tuple[SectionData, SubSection]:
        if create_new_data:
            data = SectionData(
                title=self.data.title,
                description=self.data.description,
                pk=uuid.uuid4(),
            )
        else:
            data = self.data

        sub_section = SubSection(
            data_id=data.pk,
            universal_sub_section_id=universal_sub_section_id or self.universal_sub_section_id,
            order_num=self.order_num,
            pk=uuid.uuid4(),

            main_section_id=main_section_id,
        )

        return data, sub_section

    @staticmethod
    def get_max_order_num(main_section: MainSection) -> int:
        # Returns -1 if there are no main sections in the deck
        sub_sections = SubSection.objects.filter(main_section=main_section)
        max_ss_num_obj = sub_sections.order_by('order_num').last()

        return getattr(max_ss_num_obj, 'order_num', -1)

    def get_self_max_order_num(self) -> int:
        return SubSection.get_max_order_num(self.main_section)
