import uuid

from django.apps import apps
from django.db import models
from django.db.models import Q
from django.utils import timezone
from utils import get_morning


# Abstract section that `MainSection` and `SubSection` inherit from
class AbstractSection(models.Model):
    # === BASIC INFO ===
    title = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )  # defaults to `tags`, but can be used as an alias
    tag = models.CharField(max_length=128)

    # === CACHES ===
    # Calculating percent complete is expensive, so we cache it
    # Cache is cleared when a flashcard is completed or when fetching and a day has passed
    cached_percent_complete = models.FloatField(null=True, blank=True)
    cached_percent_complete_time = models.DateTimeField(null=True, blank=True)

    # === OTHER ===
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return self.title or self.tag

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

        tag_query = self.get_review_instance_query()
        total_num = ReviewInstance.objects.filter(tag_query).count()
        tag_query &= (
            Q(learning_status='LEARNED')
            &
            Q(next_review__gt=get_morning())
        )  # learned flashcards that aren't due
        completed_num = ReviewInstance.objects.filter(tag_query).count()

        percent_complete = round(completed_num / total_num, 2)
        self.cached_percent_complete = percent_complete
        self.cached_percent_complete_time = timezone.now()

        return percent_complete


class MainSection(AbstractSection):
    deck = models.ForeignKey(
        'decks.Deck',
        on_delete=models.CASCADE,
        related_name='skill_tree_sections',
        null=True, blank=True,  # only when attached to a snapshot
    )
    universal_mainsection_id = models.UUIDField(null=True, blank=True)

    def get_review_instance_query(self):
        ReviewInstance = apps.get_model('decks', 'ReviewInstance')
        return (
            ReviewInstance.search_tags(self.tag)
            &
            Q(flashcard__deck=self.deck)
        )


class SubSection(AbstractSection):
    parent = models.ForeignKey(
        MainSection,
        on_delete=models.CASCADE,
        related_name='children',
    )
    universal_subsection_id = models.UUIDField(null=True, blank=True)

    def get_review_instance_query(self):
        ReviewInstance = apps.get_model('decks', 'ReviewInstance')
        return (
            ReviewInstance.search_tags(
                f'{self.parent.tag} AND {self.tag}'
            )
            &
            Q(flashcard__deck=self.parent.deck)
        )
