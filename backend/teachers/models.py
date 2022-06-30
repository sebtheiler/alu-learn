from __future__ import annotations

import uuid
from typing import List

from decks.models import Deck, ReviewInstance
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.crypto import get_random_string
from profiles.models import Profile
from sharing_system.models import SharedDeck
from skill_tree.models import SubSection

User = get_user_model()


class Classroom(models.Model):
    title = models.CharField(max_length=128)
    code = models.CharField(max_length=8)
    teachers = models.ManyToManyField(Profile, related_name='classrooms_taught')
    students = models.ManyToManyField(Profile, related_name='classrooms_in', blank=True)
    shared_deck = models.ForeignKey(
        SharedDeck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attached_to_classrooms',
    )

    def __str__(self) -> str:
        return self.title

    def attach_deck(self, deck: Deck) -> SharedDeck:
        # Create, get, or remix shared deck
        description = f'Deck for "{self.title}."  Students can copy and study this deck.'
        if deck.equivalent_to_snapshot and deck.equivalent_to_snapshot.shared_deck:
            if deck.equivalent_to_snapshot.shared_deck.attached_to_classrooms.count() > 0:
                shared_deck = deck.equivalent_to_snapshot.shared_deck
            else:
                shared_deck = SharedDeck.remix(
                    origin_deck=deck,
                    title=deck.title,
                    description=description,
                    view_access='STUDENT',
                    edit_access='PERSONAL',
                )
        else:
            shared_deck = SharedDeck.create(
                origin_deck=deck,
                title=deck.title,
                description=description,
                view_access='STUDENT',
                edit_access='PERSONAL',
                owners=self.teachers.all(),
            )

        # Attach the deck
        self.shared_deck = shared_deck
        self.save()

        return shared_deck

    def get_student_copied_deck(
        self,
        student: User,
        copy_if_missing: bool = False,
    ) -> Deck:
        """
        Returns the deck the specified student copied from this class
        """
        attached_deck = self.attached_student_decks.filter(user=student).first()
        if copy_if_missing:
            if attached_deck is None:
                attached_deck = self.shared_deck.copy(student, self.shared_deck.title)
                attached_deck.student_attached_to = self
                attached_deck.save()
            else:
                # Update the deck if needed
                if not attached_deck.is_updated():
                    attached_deck, _ = SharedDeck.pull(attached_deck)

        return attached_deck

    @staticmethod
    def generate_class_code() -> str:
        allowed_chars = 'BCDFGHJKMPQRTVWXY346789'
        while True:
            classroom_code = get_random_string(8, allowed_chars)
            try:
                Classroom.objects.get(code=classroom_code)
            except Classroom.DoesNotExist:
                break

        return classroom_code


class Assignment(models.Model):
    title = models.CharField(max_length=128)
    classrooms = models.ManyToManyField(Classroom, related_name='assignments')
    sub_sections = models.ManyToManyField(SubSection, related_name='attached_assignments')
    essential_only = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ('pk',)

    def __str__(self) -> str:
        return self.title

    def calc_percent_complete(
        self,
        user: User,
        assigned_sub_sections_uids: List[uuid.uuid4] = None,
    ) -> float:
        if assigned_sub_sections_uids is None:
            assigned_sub_sections_uids = self.sub_sections.values_list(
                'universal_sub_section_id',
                flat=True,
            )

        flashcards = ReviewInstance.objects.filter(
            flashcard__sub_section__universal_sub_section_id__in=assigned_sub_sections_uids,
            flashcard__sub_section__main_section__deck__user_id=user.pk,
        ).prefetch_related('flashcard')

        total_flashcard_num = flashcards.count()
        unseen_flashcard_num = flashcards.filter(learning_status='UNSEEN').count()

        try:
            return (total_flashcard_num - unseen_flashcard_num) / total_flashcard_num
        except ZeroDivisionError:
            return 0
