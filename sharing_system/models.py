from __future__ import annotations
from collections import defaultdict

import uuid
from typing import List, Union

from accounts.models import User
from decks.models import Deck, FlashCard, ReviewInstance
from django.db import models
from django.db.models.query import QuerySet
from django.db.models.query_utils import Q
from django.db.utils import IntegrityError
from profiles.models import Profile
from skill_tree.models import MainSection, SubSection


class SharedDeck(models.Model):
    # === BASIC INFO ===
    title = models.CharField(max_length=128)
    description = models.JSONField()

    # === ACCESS OPTIONS ===
    VIEW_ACCESS_OPTIONS = (
        ('PUBLIC', 'Everybody can view this deck'),
        ('FRIENDS', 'Only friends can view this deck'),
        ('STUDENT', 'Students can view this deck (for use in Classrooms only)')
    )
    EDIT_ACCESS_OPTIONS = (
        ('PERSONAL', 'Only owners can submit edits'),
        ('FRIENDS', 'Only friends can submit edits'),
        ('STUDENT', 'Only students can submit edits'),
        ('PUBLIC', 'Everybody can submit edits'),
    )

    view_access = models.CharField(max_length=10, choices=VIEW_ACCESS_OPTIONS)
    edit_access = models.CharField(max_length=10, choices=EDIT_ACCESS_OPTIONS)
    owners = models.ManyToManyField(Profile, related_name='owned_shared_decks')

    EDITABLE_ATTRS = ('title', 'description', 'view_access', 'edit_access')

    def __str__(self) -> str:
        return f'{self.title} by {", ".join([owner.user.username for owner in self.owners.all()])}'

    def get_latest_snapshot(self):
        return self.snapshots\
            .order_by('timestamp')\
            .prefetch_related(
                'main_sections__sub_sections__flashcards',
                'main_sections__attached_action',
                'main_sections__sub_sections__attached_action',
                'main_sections__sub_sections__flashcards__attached_action',
            )\
            .last()

    def has_view_access(self, author_pk):
        if self.view_access == 'PUBLIC' or self.is_owner(author_pk):
            return True
        elif self.view_access == 'FRIENDS':
            return Profile.objects.filter(
                friends__in=self.owners,
                pk=author_pk,
            ).exists()
        elif self.edit_access == 'STUDENT':
            raise NotImplementedError('TODO: ')

    def has_edit_access(self, author_pk: int) -> bool:
        if self.edit_access == 'PERSONAL':
            return self.owners.filter(pk=author_pk).exists()
        elif self.edit_access == 'FRIENDS':
            return Profile.objects.filter(
                friends__in=self.owners,
                pk=author_pk,
            ).exists()
        elif self.edit_access == 'STUDENT':
            raise NotImplementedError('TODO: ')

    def is_owner(self, author_pk: int):
        return self.owners.filter(pk=author_pk).exists()

    @staticmethod
    def create(
        origin_deck: Deck,
        title: str,
        description: str,
        view_access: str,
        edit_access: str,
        owners: List[Profile],
    ) -> SharedDeck:
        # Create SharedDeck
        shared_deck = SharedDeck.objects.create(
            title=title,
            description=description,
            view_access=view_access,
            edit_access=edit_access,
        )
        shared_deck.owners.set(owners)

        # Push changes to shared_deck
        # TODO: SELECT RELATED origin_deck.user.profile
        SharedDeck.push(
            origin_deck,
            shared_deck,
            author=origin_deck.user.profile,
            message='Initial snapshot',
        )

        return shared_deck

    def copy(self, user: User, destination_title: str = None) -> Deck:
        latest_snapshot = self.get_latest_snapshot()
        deck = Deck.objects.create(
            user=user,
            title=destination_title or latest_snapshot.shared_deck.title,
            equivalent_to_snapshot=latest_snapshot,
        )

        # NOTE: these could be rewritten to use `...Action`, but it is
        # inefficient since it implies having to apply every snapshot since creation
        # when we could just directly copy the latest snapshot

        # Copy tree
        main_sections_to_create = []
        sub_sections_to_create = []
        flashcards_to_create = []
        review_instances_to_create = []

        main_sections_to_copy = latest_snapshot.main_sections.all()\
            .prefetch_related('sub_sections__flashcards')
        for main_section_to_copy in main_sections_to_copy:
            main_section = MainSection(
                deck=deck,
                title=main_section_to_copy.title,
                description=main_section_to_copy.description,

                universal_main_section_id=main_section_to_copy.universal_main_section_id,
                id=uuid.uuid4(),
            )
            main_sections_to_create.append(main_section)

            for sub_section_to_copy in main_section_to_copy.sub_sections.all():
                sub_section = SubSection(
                    main_section=main_section,
                    title=sub_section_to_copy.title,
                    description=sub_section_to_copy.description,

                    universal_sub_section_id=sub_section_to_copy.universal_sub_section_id,
                    id=uuid.uuid4(),
                )
                sub_sections_to_create.append(sub_section)

                for flashcard_to_copy in sub_section_to_copy.flashcards.all():
                    flashcard, review_instances = flashcard_to_copy.copy(
                        flashcard_to_copy.universal_flashcard_id,
                    )

                    flashcards_to_create.append(flashcard)
                    review_instances_to_create += review_instances

        # Create objects
        MainSection.objects.bulk_create(main_sections_to_create)
        SubSection.objects.bulk_create(sub_sections_to_create)
        FlashCard.objects.bulk_create(flashcards_to_create)
        ReviewInstance.objects.bulk_create(review_instances_to_create)

        # Link flashcards to sub sections
        # TODO: make more efficient
        for ss_to_copy, copied_ss in zip(
            SubSection.objects.filter(main_section__snapshot_id=latest_snapshot.pk),
            sub_sections_to_create,
        ):
            copied_ss.flashcards.set(ss_to_copy.flashcards)

        return deck

    @staticmethod
    def push(
        deck: Deck,
        shared_deck: SharedDeck,
        author: Profile,
        message: str,
    ) -> SnapShot:
        print('1', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=shared_deck).count())
        latest_snapshot = shared_deck.get_latest_snapshot()
        if deck.equivalent_to_snapshot != latest_snapshot:
            raise ValueError('Deck is not up to date')

        # Check edit access
        if not shared_deck.is_owner(author.pk):
            raise PermissionError('User does not have permission to edit')

        # Create new snapshot
        print('2', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=shared_deck).count())
        snapshot = SnapShot.create_child(
            parent=latest_snapshot,
            author=author,
            message=message,
            shared_deck_id=shared_deck.pk,

            # Instead of removing EDIT/DELETE flashcards later,
            # it is easier to never include them
            flashcard_uids_to_remove=FlashCard.objects.filter(
                Q(sub_sections__main_section__deck_id=deck.pk) &
                (Q(attached_action__action='EDIT') | Q(attached_action__action='DELETE'))
            ).values_list('universal_flashcard_id', flat=True)
        )
        deck.equivalent_to_snapshot = snapshot
        deck.save()
        print('3', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=shared_deck).count())

        # Apply actions
        MainSectionAction.apply(
            deck.mainsectionactions,
            snapshot,
        )
        print('14', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
        SubSectionAction.apply(
            deck.subsectionactions,
            snapshot,
        )
        print('21', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
        FlashCardAction.apply(
            deck.flashcardactions,
            snapshot,
        )
        print('end', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

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
            if snapshot.main_section is None:
                raise ValueError('Unable to relate the deck\'s snapshot to the latest snapshot')
            elif snapshot.main_section == deck_snapshot:
                break
            else:
                snapshots_to_apply.append(snapshot)
                snapshot = snapshot.main_section

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
    # === BASIC INFO ===
    author = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='authored_snapshots',
    )

    message = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # === SHARED DECK ===
    shared_deck = models.ForeignKey(
        SharedDeck,
        on_delete=models.CASCADE,
        related_name='snapshots',
    )
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='sub_sections',
    )

    # === OTHER ===
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self) -> str:
        return f'Snapshot for {self.shared_deck}: {self.message}'

    @staticmethod
    def create_child(
        parent: Union[SnapShot, None],
        author: Profile,
        message: str,
        shared_deck_id: int,
        flashcard_uids_to_remove: List[str] = [],
    ) -> SnapShot:
        child = SnapShot.objects.create(
            message=message,
            author=author,
            shared_deck_id=shared_deck_id,
            parent=parent,
        )
        print('2.1', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck_id=shared_deck_id).count())

        if parent is None:
            return child

        # Copy main sections and sub sections
        main_sections = []
        sub_sections = []
        for ms_to_copy in parent.main_sections.all():
            copied_ms = ms_to_copy.copy(child.pk)
            main_sections.append(copied_ms)

            for ss_to_copy in ms_to_copy.sub_sections.all():
                copied_ss = ss_to_copy.copy(copied_ms.pk)
                sub_sections.append(copied_ss)
        print('2.2', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck_id=shared_deck_id).count())

        # Create main sections and sub sections
        MainSection.objects.bulk_create(main_sections)
        SubSection.objects.bulk_create(sub_sections)
        print('2.3', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck_id=shared_deck_id).count())

        # Link old flashcards
        # TODO: make more efficient
        for ss_to_copy, copied_ss in zip(
            SubSection.objects.filter(main_section__snapshot_id=parent.pk),
            sub_sections,
        ):
            copied_ss.flashcards.set(ss_to_copy.flashcards.filter(~Q(
                universal_flashcard_id__in=flashcard_uids_to_remove,
            )))
            print('2.4', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck_id=shared_deck_id).count())
        print('2.5', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck_id=shared_deck_id).count())

        return child


class AbstractAction(models.Model):
    # Each action must either have a deck or a snapshot: XOR
    # Actions are initially attached to a Deck, but when that Deck is synced
    # with a SharedDeck, they are transfered to a SnapShot
    deck = models.ForeignKey(
        Deck,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='%(class)ss',
        related_query_name='%(class)ss',
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

    @staticmethod
    def apply(*args, **kwargs):
        # TODO: unify these into one function
        raise NotImplementedError('Non-abstract instances must implement applying')

    @staticmethod
    def create_action(*args, **kwargs):
        # TODO: unify these into one function
        raise NotImplementedError('Non-abstract instances must implement creating actions')


class MainSectionAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    main_section = models.OneToOneField(
        MainSection,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='attached_action',
        unique=True,
    )
    universal_main_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def apply(actions: QuerySet[MainSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('main_section').all()

        main_sections_to_create = []
        main_sections_to_edit = []
        main_section_uids_to_delete = []
        origin_mainsections_to_update_uid = []

        for action in actions:
            ms_origin = action.main_section
            ms_destination = None  # set in CREATE/EDIT; not DELETE
            print('4', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

            if action.action == 'CREATE':
                ms_destination = MainSection(
                    title=ms_origin.title,
                    description=ms_origin.description,
                    universal_main_section_id=ms_origin.pk,
                )
                main_sections_to_create.append(ms_destination)

                # Note that the main section is now universally synced
                ms_origin.universal_main_section_id = ms_origin.pk
                origin_mainsections_to_update_uid.append(ms_origin)
                print('5', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
            elif action.action == 'EDIT':
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    snapshot=snapshot,
                )  # TODO: find a way to prefetch this

                for attr in MainSection.EDITABLE_ATTRS:
                    setattr(ms_destination, attr, getattr(ms_origin, attr))

                main_sections_to_edit.append(ms_destination)
                print('6', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
            else:
                main_section_uids_to_delete.append(ms_origin.universal_main_section_id)
                print('7', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

            # Update the action
            action.deck = None
            action.snapshot = snapshot
            if ms_destination is not None:
                action.main_section = ms_destination
            print('8', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        MainSection.objects.bulk_create(main_sections_to_create)
        snapshot.main_sections.add(*main_sections_to_create)
        snapshot.save()
        print('9', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        MainSection.objects.bulk_update(main_sections_to_edit, MainSection.EDITABLE_ATTRS)
        print('10', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
        MainSection.objects.filter(
            universal_main_section_id__in=main_section_uids_to_delete,
            snapshot=snapshot,
        )
        print('11', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Note that the origin main sections are now universally synced
        MainSection.objects.bulk_update(
            origin_mainsections_to_update_uid,
            ('universal_main_section_id',),
        )
        print('12', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Transfer the actions from the deck to the snapshot
        MainSectionAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'main_section'),
        )
        print('13', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

    @staticmethod
    def create_action(action: str, main_section: MainSection):
        if action == 'DELETE':
            try:
                # Try deleting any action that is currently attached to the sub section
                # TODO: won't these be deleted by CASCADE?
                attached_action = MainSectionAction.objects.get(main_section=main_section)
                attached_action.delete()
            except MainSectionAction.DoesNotExist:
                pass

            # Create a DELETE action
            if main_section.universal_main_section_id:
                return MainSectionAction.objects.create(
                    deck_id=main_section.deck_id,
                    action=action,
                    universal_main_section_id=main_section.universal_main_section_id,
                )
            else:
                return

        try:
            # Create a CREATE/EDIT action
            return MainSectionAction.objects.create(
                deck_id=main_section.deck_id,
                action=action,
                main_section=main_section,
            )
        except IntegrityError:
            # If creating an EDIT action, and there is already a CREATE action, pass
            pass


class SubSectionAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    sub_section = models.OneToOneField(
        SubSection,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='attached_action',
        unique=True,
    )
    universal_sub_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def apply(actions: QuerySet[SubSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('sub_section__main_section').all()

        sub_sections_to_create = []
        sub_sections_to_edit = []
        sub_section_uids_to_delete = []
        origin_subsections_to_update_uid = []
        print('15', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        for action in actions:
            ss_origin = action.sub_section
            ss_destination = None  # set in CREATE/EDIT; not DELETE

            if action.action == 'CREATE':
                main_section = snapshot.main_sections.get(
                    universal_main_section_id=(
                        ss_origin.main_section.universal_main_section_id
                    ),
                )
                ss_destination = SubSection(
                    main_section=main_section,
                    title=ss_origin.title,
                    description=ss_origin.description,
                    universal_sub_section_id=ss_origin.pk,
                )
                sub_sections_to_create.append(ss_destination)

                # Note that the sub section is now universally synced
                ss_origin.universal_sub_section_id = ss_origin.pk
                origin_subsections_to_update_uid.append(ss_origin)
            elif action.action == 'EDIT':
                ss_destination = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__snapshot_id=snapshot.pk,
                )  # TODO: find a way to prefetch this

                for attr in SubSection.EDITABLE_ATTRS:
                    setattr(ss_destination, attr, getattr(ss_origin, attr))

                sub_sections_to_edit.append(ss_destination)
            else:
                sub_section_uids_to_delete.append(ss_origin.universal_sub_section_id)

            # Update the action
            action.deck = None
            action.snapshot = snapshot
            if ss_destination:
                action.sub_section = ss_destination
            print('15', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        SubSection.objects.bulk_create(sub_sections_to_create)
        print('16', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        SubSection.objects.bulk_update(sub_sections_to_edit, SubSection.EDITABLE_ATTRS)
        print('17', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())
        SubSection.objects.filter(
            universal_sub_section_id__in=sub_section_uids_to_delete,
            main_section__snapshot=snapshot,
        )
        print('18', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Note that the origin sub sections are now universally synced
        SubSection.objects.bulk_update(
            origin_subsections_to_update_uid,
            ('universal_sub_section_id',),
        )
        print('20', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Transfer the actions from the deck to the snapshot
        SubSectionAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'sub_section'),
        )
        print('20', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

    @staticmethod
    def create_action(action: str, sub_section: SubSection, deck_id: int = None):
        if action == 'DELETE':
            try:
                # Try deleting any action that is currently attached to the sub section
                attached_action = SubSectionAction.objects.get(sub_section=sub_section)
                attached_action.delete()
            except SubSectionAction.DoesNotExist:
                pass

            # Create a DELETE action
            if sub_section.universal_sub_section_id:
                return SubSectionAction.objects.create(
                    deck_id=deck_id or sub_section.main_section.deck_id,
                    action=action,
                    universal_sub_section_id=sub_section.universal_sub_section_id,
                )
            else:
                return

        try:
            # Create a CREATE/EDIT action
            return SubSectionAction.objects.create(
                deck_id=deck_id or sub_section.main_section.deck_id,
                action=action,
                sub_section=sub_section,
            )
        except IntegrityError:
            # If creating an EDIT action, and there is already a CREATE action, pass
            pass


class FlashCardAction(AbstractAction):
    # Each action must either have a flashcard currently attached to it (edits
    # or additions), or an abstract universal flashcard ID: XOR
    flashcard = models.OneToOneField(
        FlashCard,
        on_delete=models.CASCADE,
        related_name='attached_action',
        unique=True,
    )
    universal_flashcard_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def apply(
        actions: QuerySet[FlashCardAction],
        snapshot: SnapShot,
    ):
        # NOTE: since FlashCards are not duplicated between snapshots
        # (unlike sections), this function is considerably different from
        # the other `Action.apply`s
        actions = actions.prefetch_related('flashcard').all()

        # Hold a dict of sub sections to the flashcards to link to them
        # key: universal_sub_section_id; val: flashcards to link to that sub section
        sub_sections_to_link_flashcards = defaultdict(list)

        flashcards_to_create = []
        origin_flashcards_to_update_uid = []
        print('22', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        for action in actions:
            fc_origin = action.flashcard

            # In CREATE/EDIT, a new flashcard is created
            # NOTE: Deleted and edited flashcards are never added when creating
            if action.action == 'CREATE' or action.action == 'EDIT':
                fc_destination, _ = fc_origin.copy(
                    skip_creating_review_instances=True,
                    universal_flashcard_id=fc_origin.pk,
                )
                flashcards_to_create.append(fc_destination)
                sub_sections_to_link_flashcards[
                    fc_origin.sub_sections.first().universal_sub_section_id
                ].append(fc_destination)

                # Note that this flashcard is now universally synced
                fc_origin.universal_flashcard_id = fc_origin.pk
                origin_flashcards_to_update_uid.append(fc_origin)

                action.flashcard = fc_destination
            print('23', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

            # Update the action
            action.deck = None
            action.snapshot = snapshot

        FlashCard.objects.bulk_create(flashcards_to_create)
        print('24', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Note that the origin flashcards are now universally synced
        FlashCard.objects.bulk_update(
            origin_flashcards_to_update_uid,
            ('universal_flashcard_id',),
        )
        print('25', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Transfer the actions from the deck to the snapshot
        FlashCardAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'flashcard')
        )
        print('26', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())

        # Link the new flashcards to their sub sections
        for (
            universal_sub_section_id,
            flashcards_to_link,
        ) in sub_sections_to_link_flashcards.items():
            sub_section = SubSection.objects.get(
                main_section__snapshot=snapshot,
                universal_sub_section_id=universal_sub_section_id,
            )
            sub_section.flashcards.add(*flashcards_to_link)
        print('26.1', FlashCard.objects.filter(sub_sections__main_section__snapshot__shared_deck=snapshot.shared_deck).count())


    @staticmethod
    def create_action(action: str, flashcard: FlashCard):
        if action == 'DELETE':
            try:
                # Try deleting any action that is currently attached to the sub section
                attached_action = FlashCardAction.objects.get(flashcard=flashcard)
                attached_action.delete()
            except FlashCardAction.DoesNotExist:
                pass

            # Create a delete action
            if flashcard.universal_flashcard_id:
                return FlashCardAction.objects.create(
                    deck_id=flashcard.deck_id,
                    action=action,
                    universal_flashcard_id=flashcard.universal_flashcard_id,
                )
            else:
                return

        try:
            # Create a CREATE/EDIT action
            return FlashCardAction.objects.create(
                deck_id=flashcard.deck_id,
                action=action,
                flashcard=flashcard,
            )
        except IntegrityError:
            # If creating an EDIT action, and there is already a CREATE action, pass
            pass
