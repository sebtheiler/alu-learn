from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.query_utils import Q
from decks.models import Deck, ReviewInstance
from community.models import SharedDeck
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
    )

    def __str__(self) -> str:
        return self.title

    def attach_deck(self, deck: Deck) -> SharedDeck:
        # Create shared deck
        shared_deck = SharedDeck.create(
            deck=deck,
            title=deck.title,
            description=f'Deck for "{self.title}."  Students can copy and study this deck.',
            view_access='STUDENT',
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
        flashcards = ReviewInstance.objects.filter(
            Q(
                flashcard__deck__student_attached_to=self.classroom,
                flashcard__deck__user=user,
            ) &
            ReviewInstance.search_tags(self.tag_query)
        ).prefetch_related('flashcard')
        total_flashcard_num = flashcards.count()
        unseen_flashcard_num = flashcards.filter(learning_status='UNSEEN').count()

        try:
            return (total_flashcard_num - unseen_flashcard_num) / total_flashcard_num
        except ZeroDivisionError:
            return None
