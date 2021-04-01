from __future__ import annotations

from typing import Tuple, Union
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from decks.models import Deck, FlashCard, SharedDeck, StudySessionManager
from profiles.models import Profile
from django.utils.crypto import get_random_string

User = get_user_model()


class Classroom(models.Model):
    title = models.CharField(max_length=128)
    code = models.CharField(max_length=8)
    teachers = models.ManyToManyField(Profile, related_name='classrooms_taught')
    students = models.ManyToManyField(Profile, related_name='classrooms_in', blank=True)
    deck = models.OneToOneField(
        SharedDeck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attached_to_classroom',
    )  # type: SharedDeck

    def __str__(self) -> str:
        return self.title

    def attach_deck(self, deck: Deck) -> SharedDeck:
        # Create shared deck
        shared_deck = deck.create_shared_deck(
            deck.title,
            f'Deck for "{self.title}."  Students can copy and study this deck.',
            sharing_setting='STUDENT',
            include_copied_flashcards=True,
        )

        # Attach the deck
        self.deck = shared_deck
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
        try:
            return Deck.objects.get(
                user=student,
                student_attached_to=self,
            )
        except Deck.DoesNotExist:
            if copy_if_missing:
                if self.deck is None:
                    raise AttributeError('Teacher has not attached deck to this classroom')
                return self.deck.clone(student)
            else:
                return None

    @staticmethod
    def generate_class_code() -> str:
        allowed_chars = 'bcdfghjkmpqrtvwxyBCDFGHJKMPQRTVWXY346789-_'
        while True:
            classroom_code = get_random_string(8, allowed_chars)
            try:
                Classroom.objects.get(code=classroom_code)
            except Classroom.DoesNotExist:
                break

        return classroom_code


class Assignment(models.Model):
    title = models.CharField(max_length=128)
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='assignments',
    )  # type: Classroom
    tag_query = models.CharField(max_length=128)
    due_date = models.DateField()

    def __str__(self) -> str:
        return self.title

    def calc_percent_complete(self, user: User) -> float:
        flashcards = FlashCard.objects.filter(
            Q(
                creator__deck__student_attached_to=self.classroom,
                creator__deck__user=user,
            ) &
            FlashCard.search_tags(self.tag_query)
        )
        total_flashcard_num = flashcards.count()
        unseen_flashcard_num = flashcards.filter(learning_status='UNSEEN').count()

        try:
            return (total_flashcard_num - unseen_flashcard_num) / total_flashcard_num
        except ZeroDivisionError:
            return None

    def get_study_session_manager(self, user: User) -> AssignmentStudySessionManager:
        try:
            assm = AssignmentStudySessionManager.objects.get(
                assignment=self,
                user=user.profile,
            )

            return assm.pk
        except AssignmentStudySessionManager.DoesNotExist:
            return None


class ASSMManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('assignment', 'user')


class AssignmentStudySessionManager(StudySessionManager):
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='assignment_study_session_managers',
    )  # type: Assignment

    objects = ASSMManager()

    def __str__(self) -> str:
        return f'ASSM for {self.assignment.title} by {self.user}'

    def get_attached_deck(self) -> Union[Deck, None]:
        try:
            return Deck.objects.get(
                user=self.user.user,
                student_attached_to=self.assignment.classroom,
            )
        except Deck.DoesNotExist:
            return None

    def get_flashcards(self) -> Tuple[QuerySet[FlashCard], QuerySet[FlashCard]]:
        review_cutoff = self.calc_review_cutoff()

        deck = self.get_attached_deck()
        if deck is None:
            deck = self.assignment.classroom.deck.clone(
                self.user.user,
            )

        # Get flashcards from deck
        ssm_flashcards = FlashCard.objects.filter(
            Q(creator__deck__pk=deck.pk) &
            FlashCard.search_tags(self.assignment.tag_query)
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
