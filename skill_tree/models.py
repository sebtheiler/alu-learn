from django.db import models


# Abstract section that `MainSection` and `SubSection` inherit from
class AbstractSection(models.Model):
    title = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )  # defaults to `tags`, but can be used as an alias
    tag = models.CharField(max_length=128)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return self.title or self.tag


class MainSection(AbstractSection):
    deck = models.ForeignKey(
        'decks.Deck',
        on_delete=models.CASCADE,
        related_name='skill_tree_sections',
    )


class SubSection(AbstractSection):
    parent = models.ForeignKey(
        MainSection,
        on_delete=models.CASCADE,
        related_name='children',
    )
