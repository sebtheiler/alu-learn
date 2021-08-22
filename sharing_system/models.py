from __future__ import annotations

from accounts.models import User
from decks.models import Deck, FlashCard, ReviewInstance
from django.db import models
from django.db.models.expressions import F, Q
from django.db.models.query import QuerySet
from skill_tree.models import MainSection, SubSection


class SharedDeck(models.Model):
    title = models.CharField(max_length=128)
    description = models.JSONField()

    VIEW_ACCESS_OPTIONS = (
        ('PUBLIC', 'Everybody can view this deck'),
        ('FRIENDS', 'Only friends can view this deck'),
        ('STUDENT', 'Students can view this deck (for use in Classrooms only)')
    )
    EDIT_ACCESS_OPTIONS = (
        ('PERSONAL', 'Only you can submit edits'),
        ('FRIENDS', 'Only friends can submit edits'),
        ('PUBLIC', 'Everybody can submit edits'),
    )

    view_access = models.CharField(max_length=10, choices=VIEW_ACCESS_OPTIONS)
    edit_access = models.CharField(max_length=10, choices=EDIT_ACCESS_OPTIONS)
    owners = models.CharField(max_length=128)

    def __str__(self) -> str:
        return f'{self.title} by {self.owners}'

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

        # Apply CREATE actions to clone sections
        MainSectionAction.apply(
            deck.mainsectionactions.filter(action='CREATE'),
            snapshot,
        )

        # Apply CREATE actions to clone FlashCards (not ReviewInstances)
        deck_flashcard_actions = deck.flashcardactions.filter(action='CREATE')
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

    def push(self, deck: Deck, message: str) -> SnapShot:
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

        deck_flashcard_actions = deck.flashcardactions.all()\
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

    def pull(self, deck: Deck) -> Deck:
        if deck.is_updating:
            raise ValueError('Deck is already updating')

        deck.is_updating = True
        deck.save()

        latest_snapshot = self.snapshots.order_by('timestamp').last()

        # TODO: this results in lots of DB queries that could be solved recursively
        deck_snapshot = deck.equivalent_to_snapshot
        snapshot = latest_snapshot
        snapshots_to_apply = []
        while True:
            if snapshot.parent is None:
                raise ValueError('Unable to relate the deck\'s snapshot to the latest snapshot')
            elif snapshot.parent == deck_snapshot:
                break
            else:
                snapshots_to_apply.append(snapshot)
                snapshot = snapshot.parent

        # Clean up `snapshots_to_apply`
        if len(snapshots_to_apply) == 0:
            raise ValueError('No updates to apply')
        elif len(snapshots_to_apply) > 2:
            # Only makes sense to justify this operation with 3+ snapshots to apply
            snapshots_to_apply = SnapShot.objects.filter(
                pk__in=[snapshot.pk for snapshot in snapshots_to_apply],
            ).prefetch_related(
                'applied_flashcardactions',
                'applied_flashcardactions__flashcard',
            ).all()

        # Apply the snapshots that need applying
        flashcards_to_create = []
        flashcards_to_edit = []
        flashcard_uids_to_delete = []
        for snapshot in snapshots_to_apply:
            snapshot_flashcard_actions = snapshot.applied_flashcardactions\
                .all()\
                .prefetch_related('flashcard')
            for snapshot_flashcard_action in snapshot_flashcard_actions:
                if snapshot_flashcard_action.action == 'CREATE':
                    # TODO: also create review instances
                    origin_flashcard = snapshot_flashcard_action.flashcard
                    flashcards_to_create.append(FlashCard(
                        deck=deck,
                        flashcard_type=origin_flashcard.flashcard_type,
                        flashcard_num=origin_flashcard.flashcard_num,
                        fields=origin_flashcard.fields,
                        tags=origin_flashcard.tags,
                        front_image=origin_flashcard.front_image,
                        back_image=origin_flashcard.back_image,

                        # Inherits universal ID from ID of the flashcard it was created from
                        universal_flashcard_id=origin_flashcard.pk,
                    ))
                elif snapshot_flashcard_action.action == 'EDIT':
                    origin_flashcard = snapshot_flashcard_action.flashcard
                    # TODO: make this work for cloze when the # of RI's changes
                    flashcard_to_edit = FlashCard.objects.get(
                        universal_flashcard_id=origin_flashcard.universal_flashcard_id,
                    )
                    for attr in FlashCard.EDITABLE_ATTRS:
                        setattr(flashcard_to_edit, attr, getattr(origin_flashcard, attr))

                    flashcards_to_edit.append(flashcard_to_edit)
                else:
                    flashcard_uids_to_delete.append(
                        snapshot_flashcard_action.flashcard.universal_flashcard_id,
                    )

        FlashCard.objects.bulk_create(flashcards_to_create)
        FlashCard.objects.bulk_update(flashcards_to_edit, FlashCard.EDITABLE_ATTRS)
        FlashCard.objects.filter(
            deck=deck, universal_flashcard_id__in=flashcard_uids_to_delete,
        ).delete()

        deck.equivalent_to_snapshot = latest_snapshot
        deck.is_updating = False
        deck.save()

        return deck


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
    main_sections = models.ManyToManyField(
        MainSection,
        related_name='shared_deck_snapshots',
    )

    def __str__(self) -> str:
        return f'Snapshot for {self.shared_deck}: {self.message}'


class AbstractAction(models.Model):
    # Each action must either have a deck or a snapshot: XOR
    # Actions are initially attached to a Deck, but when that Deck is synced
    # with a SharedDeck, they are transfered to a SnapShot
    deck = models.ForeignKey(
        Deck,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='%(class)s',
        related_query_name='%(class)s',
    )
    snapshot = models.ForeignKey(
        SnapShot,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='applied_%(class)s',
        related_query_name='applied_%(class)s',
    )

    ACTION_OPTIONS = (
        ('CREATE', 'Create'),
        ('EDIT', 'Edit'),
        ('DELETE', 'Delete'),
    )
    action = models.CharField(max_length=8, choices=ACTION_OPTIONS)

    class Meta:
        abstract = True


class FlashCardAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    flashcard = models.OneToOneField(
        FlashCard,
        on_delete=models.CASCADE,
        related_name='attached_action',
    )
    universal_flashcard_id = models.UUIDField(null=True, blank=True)


class MainSectionAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    main_section = models.OneToOneField(
        MainSection,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='attached_action',
    )
    universal_main_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def apply(actions: QuerySet[MainSectionAction], snapshot: SnapShot):
        main_sections_to_create = []
        for action in actions.prefetch_related('main_section'):
            if action.action == 'CREATE':
                ms_to_copy = action.main_section
                main_sections_to_create.append(MainSection(
                    title=ms_to_copy.title,
                    tag=ms_to_copy.tag,
                ))
            elif action.action == 'EDIT':
                ...  # TODO:
            else:
                ...  # TODO:

        snapshot.main_sections.add(main_sections_to_create)


class SubSectionAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    sub_section = models.OneToOneField(
        SubSection,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='attached_action',
    )
    universal_sub_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def apply(actions: QuerySet[SubSectionAction], snapshot: SnapShot):
        sub_sections_to_create = []
        for action in actions.prefetch_related('sub_section__main_section'):
            if action.action == 'CREATE':
                ss_to_copy = action.sub_section
                main_section = snapshot.main_sections.get(
                    universal_flashcard_id=ss_to_copy,
                )
                sub_sections_to_create.append(SubSection(
                    main_section=main_section,
                    title=ss_to_copy.title,
                    tag=ss_to_copy.tag,
                ))
            elif action.action == 'EDIT':
                ...  # TODO:
            else:
                ...  # TODO:
