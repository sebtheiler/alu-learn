from __future__ import annotations

from accounts.models import User
from decks.models import Deck, FlashCard
from django.db import models


class SharedDeck(models.Model):
    title = models.CharField(max_length=128)
    description = models.JSONField()

    VIEW_ACCESS_OPTIONS = (
        ('PUBLIC', 'Everybody can view this deck'),
        ('FRIENDS', 'Only friends can view this deck'),
    )
    EDIT_ACCESS_OPTIONS = (
        ('PERSONAL', 'Only you can submit edits'),
        ('FRIENDS', 'Only friends can submit edits'),
        ('PUBLIC', 'Everybody can submit edits'),
    )

    view_access = models.CharField(max_length=10, choices=VIEW_ACCESS_OPTIONS)
    edit_access = models.CharField(max_length=10, choices=EDIT_ACCESS_OPTIONS)
    owners = models.CharField(max_length=128)

    @classmethod
    def create_from_deck(
        deck: Deck,
        title: str,
        description: str,
        view_access: str,
        edit_access: str,
        owners: str,
    ) -> SharedDeck:
        # Create SharedDeck and SnapShot
        shared_deck = SharedDeck.objects.create(
            title=title,
            description=description,
            view_access=view_access,
            edit_access=edit_access,
            owners=owners,
        )

        snapshot = SnapShot.objects.create(
            message='Initial snapshot',
            shared_deck=shared_deck,
            parent=None,
        )
        deck.equivalent_to_snapshot = snapshot
        deck.save()

        # Apply CREATE actions to clone FlashCards (not ReviewInstances)
        deck_flashcard_actions = deck.flashcard_actions.filter(action='CREATE')
        flashcards = FlashCard.objects\
            .filter(attached_action__in=deck_flashcard_actions)\
            .values((
                'flashcard_type', 'flashcard_num',
                'fields', 'tags',
                'front_image', 'back_image'
            ))

        flashcards_to_create = [FlashCard(**flashcard_values) for flashcard_values in flashcards]
        snapshot.flashcards.add(*flashcards_to_create)

        # Transfer actions from the deck to the new snapshot
        deck_flashcard_actions.update(deck=None, snapshot=snapshot)

        return shared_deck


class SnapShot(models.Model):
    message = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    shared_deck = models.ForeignKey(
        SharedDeck,
        on_delete=models.CASCADE,
        related_name='snapshots',
    )
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='children',
    )
    flashcards = models.ManyToManyField(
        FlashCard,
        related_name='shared_deck_snapshots',
    )


class FlashCardAction(models.Model):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    flashcard = models.OneToOneField(
        FlashCard,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='attached_action',
    )
    universal_flashcard_id = models.UUIDField(null=True, blank=True)

    # Each action must either have a deck or a snapshot: XOR
    # Actions are initially attached to a Deck, but when that Deck is synced
    # with a SharedDeck, they are transfered to a SnapShot
    deck = models.ForeignKey(
        Deck,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='flashcard_actions',
    )
    snapshot = models.ForeignKey(
        SnapShot,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='applied_flashcard_actions',
    )

    ACTION_OPTIONS = (
        ('CREATE', 'Create flashcard'),
        ('EDIT', 'Edit flashcard'),
        ('DELETE', 'Delete flashcard'),
    )
    action = models.CharField(max_length=8, choices=ACTION_OPTIONS)
