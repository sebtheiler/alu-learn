from __future__ import annotations

from accounts.models import User
from decks.models import Deck, FlashCard, ReviewInstance
from django.db import models
from django.db.models.expressions import F, Q


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
    def create(
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
        flashcards = FlashCard.objects.filter(attached_action__in=deck_flashcard_actions)

        flashcards_to_create = [FlashCard(
            flashcard_type=flashcard.flashcard_type,
            flashcard_num=flashcard.flashcard_num,
            fields=flashcard.fields,
            tags=flashcard.tags,
            front_image=flashcard.front_image,
            back_image=flashcard.back_image,
            universal_flashcard_id=flashcard.pk,
        ) for flashcard in flashcards]
        snapshot.flashcards.add(*flashcards_to_create)

        # Note that the origin flashcards are now universally synced
        flashcards.update(universal_flashcard_id=F('pk'))

        # Transfer actions from the deck to the new snapshot
        deck_flashcard_actions.update(deck=None, snapshot=snapshot)

        return shared_deck

    def clone(self, user: User, destination_title: str = None) -> Deck:
        latest_snapshot = self.snapshots.order_by('timestamp').last()
        deck = Deck.objects.create(
            user=user,
            title=destination_title or latest_snapshot.shared_deck.title,
            equivalent_to_snapshot=latest_snapshot,
        )

        # NOTE: this could be rewritten to use `FlashCardAction`, but it is
        # pointless since they should all be CREATEs
        flashcards = latest_snapshot.flashcards.all()
        review_instances_to_create = []

        def create_flashcard(**kwargs):
            flashcard, review_instances = FlashCard.create_flashcard(**kwargs)
            review_instances_to_create.append(review_instances)

            return flashcard

        flashcards_to_create = [create_flashcard(
            universal_flashcard_id=flashcard.pk,
            deck=deck,
            tags=flashcard.tags,
            flashcard_type=flashcard.flashcard_type,
            flashcard_num=flashcard.flashcard_num,
            fields=flashcard.fields,
            # TODO: check that images are being cloned correctly, or rethink them
            front_image=flashcard.front_image,
            back_image=flashcard.back_image,
        ) for flashcard in flashcards]

        FlashCard.objects.bulk_create(flashcards_to_create)
        ReviewInstance.objects.bulk_create(review_instances_to_create)

        return deck

    def push(self, deck: Deck, message: str):
        latest_snapshot = self.snapshots.order_by('timestamp').last()
        if deck.equivalent_to_snapshot.pk != latest_snapshot.pk:
            raise ValueError('Deck is not up to date')

        # TODO: check ownership/edit-access

        # Create new snapshot
        snapshot = SnapShot.objects.create(
            message=message,
            shared_deck=self,
            parent=latest_snapshot,
        )

        # Apply actions
        flashcards_to_create = []
        old_flashcards_to_not_include = []  # list of `universal_flashcard_id`s to remove
        origin_flashcards_to_update_uid = []

        deck_flashcard_actions = deck.flashcard_actions.all()\
            .prefetch_related('flashcard')

        for deck_flashcard_action in deck_flashcard_actions:
            if deck_flashcard_action.action == 'CREATE':
                # Sync origin flashcard with the to-be-created flashcard, using
                # `universal_flashcard_id`
                origin_flashcard = deck_flashcard_action.flashcard
                origin_flashcard.universal_flashcard_id = origin_flashcard.pk
                origin_flashcards_to_update_uid.append(origin_flashcard)

                # Copy flashcard
                flashcards_to_create.append(FlashCard(
                    flashcard_type=origin_flashcard.flashcard_type,
                    flashcard_num=origin_flashcard.flashcard_num,
                    fields=origin_flashcard.fields,
                    tags=origin_flashcard.tags,
                    front_image=origin_flashcard.front_image,
                    back_image=origin_flashcard.back_image,

                    # Inherits universal ID from ID of the flashcard it was created from
                    universal_flashcard_id=origin_flashcard.pk,
                ))
            elif deck_flashcard_action.action == 'EDIT':
                origin_flashcard = deck_flashcard_action.flashcard

                # Copy flashcard
                snapshot.append(FlashCard(
                    flashcard_type=origin_flashcard.flashcard_type,
                    flashcard_num=origin_flashcard.flashcard_num,
                    fields=origin_flashcard.fields,
                    tags=origin_flashcard.tags,
                    front_image=origin_flashcard.front_image,
                    back_image=origin_flashcard.back_image,

                    # Inherits universal ID from the ID of its "parent"
                    universal_flashcard_id=origin_flashcard.universal_flashcard_id,
                ))

                # Remember not to include the old flashcard in the snapshot
                old_flashcards_to_not_include.append(origin_flashcard.universal_flashcard_id)
            else:
                # Remember not to include the old flashcard in the snapshot
                old_flashcards_to_not_include.append(
                    deck_flashcard_action.flashcard.universal_flashcard_id,
                )

        # Add all flashcards from the old snapshot (unless they are marked not to be added)
        snapshot.flashcards.add(latest_snapshot.flashcards.filter(
            ~Q(universal_flashcard_id__in=old_flashcards_to_not_include)
        ))

        # Add the newly created flashcards
        snapshot.flashcards.add(flashcards_to_create)

        # Note that the origin flashcards for newly created flashcards are now universally synced
        FlashCard.objects.bulk_update(origin_flashcards_to_update_uid, ('universal_flashcard_id',))

        # Transfer actions from the deck to the new snapshot
        deck_flashcard_actions.update(deck=None, snapshot=snapshot)

        return snapshot


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
