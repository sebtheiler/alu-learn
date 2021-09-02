from __future__ import annotations

import uuid
from collections import defaultdict
from typing import List, Tuple, Union

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

    def get_latest_snapshot(self, prefetch: bool = True):
        if prefetch:
            return self.snapshots\
                .order_by('timestamp')\
                .prefetch_related(
                    'main_sections__sub_sections__flashcards',
                    'main_sections__attached_action',
                    'main_sections__sub_sections__attached_action',
                    'main_sections__sub_sections__flashcards__attached_action',
                )\
                .last()
        else:
            return self.snapshots.order_by('timestamp').last()

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

        sub_sections_to_link_flashcards = defaultdict(list)

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

                sub_section_flashcards = []
                for flashcard_to_copy in sub_section_to_copy.flashcards.all():
                    flashcard, review_instances = flashcard_to_copy.copy(
                        universal_flashcard_id=flashcard_to_copy.universal_flashcard_id,
                    )

                    sub_section_flashcards.append(flashcard)
                    review_instances_to_create += review_instances

                flashcards_to_create += sub_section_flashcards
                sub_sections_to_link_flashcards[
                    sub_section.universal_sub_section_id
                ] += sub_section_flashcards

        # Create objects
        MainSection.objects.bulk_create(main_sections_to_create)
        SubSection.objects.bulk_create(sub_sections_to_create)
        FlashCard.objects.bulk_create(flashcards_to_create)
        ReviewInstance.objects.bulk_create(review_instances_to_create)

        # Link flashcards to sub sections (needs to be done after SSs are created)
        for (
            universal_sub_section_id,
            flashcards_to_link,
        ) in sub_sections_to_link_flashcards.items():
            sub_section = SubSection.objects.get(
                main_section__deck_id=deck.pk,
                universal_sub_section_id=universal_sub_section_id,
            )
            sub_section.flashcards.add(*flashcards_to_link)

        return deck

    @staticmethod
    def push(
        deck: Deck,
        shared_deck: SharedDeck,
        author: Profile,
        message: str,
    ) -> SnapShot:
        latest_snapshot = shared_deck.get_latest_snapshot()
        if deck.equivalent_to_snapshot != latest_snapshot:
            raise ValueError('Deck is not up to date')

        # Check edit access
        if not shared_deck.is_owner(author.pk):
            raise PermissionError('User does not have permission to edit')

        # Create new snapshot
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

        # Apply actions
        MainSectionAction.push(
            deck.mainsectionactions,
            snapshot,
        )
        SubSectionAction.push(
            deck.subsectionactions,
            snapshot,
        )
        FlashCardAction.push(
            deck.flashcardactions,
            snapshot,
        )

        return snapshot

    @staticmethod
    def pull(deck: Deck) -> Deck:
        shared_deck = deck.equivalent_to_snapshot.shared_deck

        # This takes a while, so you don't want to initiate two updates at once
        if deck.is_updating:
            raise ValueError('Deck is already updating')
        deck.is_updating = True
        deck.save()

        # Find a path of snapshots from the latest snapshot to the the
        # deck's `equivalent_to_snapshot`
        # TODO: this results in lots of DB queries that could be solved recursively
        latest_snapshot = shared_deck.get_latest_snapshot(prefetch=False)
        deck_snapshot = deck.equivalent_to_snapshot

        if latest_snapshot.pk == deck_snapshot.pk:
            raise ValueError('No updates to apply')

        snapshot_ids_to_apply = []
        snapshot = latest_snapshot
        while True:
            if snapshot.parent is None:
                # We've hit the beginning without finding a matching parent
                raise ValueError('Unable to relate the deck\'s snapshot to the latest snapshot')
            elif snapshot.parent == deck_snapshot:
                # We found the match
                snapshot_ids_to_apply.append(snapshot.pk)
                break
            else:
                snapshot_ids_to_apply.append(snapshot.pk)
                snapshot = snapshot.parent

        # Clean up `snapshots_to_apply`
        snapshots_to_apply = SnapShot.objects.filter(
            pk__in=snapshot_ids_to_apply,
        ).prefetch_related(
            'applied_mainsectionaction__main_section',
            'applied_subsectionaction__sub_section',
            'applied_flashcardaction__flashcard',
        ).all()

        # Get the changes that need applying
        main_sections_to_create = []
        main_sections_to_edit = []
        main_section_uids_to_delete = []

        sub_sections_to_create = []
        sub_sections_to_edit = []
        sub_section_uids_to_delete = []

        flashcards_to_create = []
        flashcards_to_edit = []
        flashcard_uids_to_delete = []
        review_instances_to_create = []
        sub_sections_to_link_flashcards = defaultdict(list)

        for snapshot in snapshots_to_apply:
            mss_to_create, mss_to_edit, ms_uids_to_del = MainSectionAction.pull(
                snapshot,
                deck,
            )
            main_sections_to_create += mss_to_create
            main_sections_to_edit += mss_to_edit
            main_section_uids_to_delete += ms_uids_to_del

            sss_to_create, sss_to_edit, ss_uids_to_del = SubSectionAction.pull(
                snapshot,
                deck,
            )
            sub_sections_to_create += sss_to_create
            sub_sections_to_edit += sss_to_edit
            sub_section_uids_to_delete += ss_uids_to_del

            (
                fcs_to_create,
                fcs_to_edit,
                fc_uids_to_del,
                ris_to_create,
                sss_to_link_fc
            ) = FlashCardAction.pull(
                snapshot,
                deck,
            )
            flashcards_to_create += fcs_to_create
            flashcards_to_edit += fcs_to_edit
            flashcard_uids_to_delete += fc_uids_to_del
            review_instances_to_create += ris_to_create
            sub_sections_to_link_flashcards |= sss_to_link_fc

        # Apply changes
        MainSection.objects.bulk_create(main_sections_to_create)
        MainSection.objects.bulk_update(main_sections_to_edit, MainSection.EDITABLE_ATTRS)
        if len(main_section_uids_to_delete) > 0:
            MainSection.objects.filter(
                deck_id=deck.pk,
                universal_main_section_id__in=main_section_uids_to_delete,
            ).delete()

        print(sub_sections_to_create)
        print(SubSection.objects.count())
        SubSection.objects.bulk_create(sub_sections_to_create)
        print(SubSection.objects.count())
        SubSection.objects.bulk_update(sub_sections_to_edit, SubSection.EDITABLE_ATTRS)
        if len(sub_section_uids_to_delete) > 0:
            SubSection.objects.filter(
                main_section__deck_id=deck.pk,
                universal_sub_section_id__in=sub_section_uids_to_delete,
            ).delete()

        FlashCard.objects.bulk_create(flashcards_to_create)
        FlashCard.objects.bulk_update(flashcards_to_edit, FlashCard.EDITABLE_ATTRS)
        if len(flashcard_uids_to_delete) > 0:
            FlashCard.objects.filter(
                sub_sections__main_section__deck_id=deck.pk,
                universal_flashcard_id__in=flashcard_uids_to_delete,
            ).delete()
        ReviewInstance.objects.bulk_create(review_instances_to_create)

        # Link the new flashcards to their sub sections
        for (
            universal_sub_section_id,
            flashcards_to_link,
        ) in sub_sections_to_link_flashcards.items():
            sub_section = SubSection.objects.get(
                main_section__deck_id=deck.pk,
                universal_sub_section_id=universal_sub_section_id,
            )
            sub_section.flashcards.add(*flashcards_to_link)

        # Update deck
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

        # Create main sections and sub sections
        MainSection.objects.bulk_create(main_sections)
        SubSection.objects.bulk_create(sub_sections)

        # Link old flashcards
        # TODO: make more efficient
        for ss_to_copy, copied_ss in zip(
            SubSection.objects.filter(main_section__snapshot_id=parent.pk),
            sub_sections,
        ):
            copied_ss.flashcards.set(ss_to_copy.flashcards.filter(~Q(
                universal_flashcard_id__in=flashcard_uids_to_remove,
            )))

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
    def push(*args, **kwargs):
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
    def push(actions: QuerySet[MainSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('main_section').all()

        main_sections_to_create = []
        main_sections_to_edit = []
        main_section_uids_to_delete = []
        origin_mainsections_to_update_uid = []

        for action in actions:
            ms_origin = action.main_section
            ms_destination = None  # set in CREATE/EDIT; not DELETE

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
            elif action.action == 'EDIT':
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    snapshot=snapshot,
                )  # TODO: find a way to prefetch this

                for attr in MainSection.EDITABLE_ATTRS:
                    setattr(ms_destination, attr, getattr(ms_origin, attr))

                main_sections_to_edit.append(ms_destination)
            else:
                main_section_uids_to_delete.append(ms_origin.universal_main_section_id)

            # Update the action
            action.deck = None
            action.snapshot = snapshot
            if ms_destination is not None:
                action.main_section = ms_destination

        MainSection.objects.bulk_create(main_sections_to_create)
        snapshot.main_sections.add(*main_sections_to_create)
        snapshot.save()

        MainSection.objects.bulk_update(main_sections_to_edit, MainSection.EDITABLE_ATTRS)
        MainSection.objects.filter(
            universal_main_section_id__in=main_section_uids_to_delete,
            snapshot=snapshot,
        )

        # Note that the origin main sections are now universally synced
        MainSection.objects.bulk_update(
            origin_mainsections_to_update_uid,
            ('universal_main_section_id',),
        )

        # Transfer the actions from the deck to the snapshot
        MainSectionAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'main_section'),
        )

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[List[MainSection], List[MainSection], List[str]]:
        actions = snapshot.applied_mainsectionaction.prefetch_related(
            'main_section',
        ).all()

        main_sections_to_create = []
        main_sections_to_edit = []
        main_section_uids_to_delete = []

        for action in actions:
            ms_origin = action.main_section

            if action.action == 'CREATE':
                main_sections_to_create.append(MainSection(
                    deck=deck,
                    title=ms_origin.title,
                    description=ms_origin.description,
                    universal_main_section_id=ms_origin.universal_main_section_id,
                ))
            elif action.action == 'EDIT':
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    deck=deck,
                )  # TODO: find a way to prefetch this

                for attr in MainSection.EDITABLE_ATTRS:
                    setattr(ms_destination, attr, getattr(ms_origin, attr))

                main_sections_to_edit.append(ms_destination)
            else:
                main_section_uids_to_delete.append(ms_origin.universal_main_section_id)

        return main_sections_to_create, main_sections_to_edit, main_section_uids_to_delete

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
    def push(actions: QuerySet[SubSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('sub_section__main_section').all()

        sub_sections_to_create = []
        sub_sections_to_edit = []
        sub_section_uids_to_delete = []
        origin_subsections_to_update_uid = []

        for action in actions:
            ss_origin = action.sub_section
            ss_destination = None  # set in CREATE/EDIT; not DELETE

            if action.action == 'CREATE':
                # TODO: do the same thing we did in FlashCardAction.apply
                # and look up main sections at the end
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

        SubSection.objects.bulk_create(sub_sections_to_create)

        SubSection.objects.bulk_update(sub_sections_to_edit, SubSection.EDITABLE_ATTRS)
        SubSection.objects.filter(
            universal_sub_section_id__in=sub_section_uids_to_delete,
            main_section__snapshot=snapshot,
        )

        # Note that the origin sub sections are now universally synced
        SubSection.objects.bulk_update(
            origin_subsections_to_update_uid,
            ('universal_sub_section_id',),
        )

        # Transfer the actions from the deck to the snapshot
        SubSectionAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'sub_section'),
        )

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[List[SubSection], List[SubSection], List[str]]:
        actions = snapshot.applied_subsectionaction.prefetch_related(
            'sub_section',
        ).all()

        sub_sections_to_create = []
        sub_sections_to_edit = []
        sub_section_uids_to_delete = []

        for action in actions:
            ss_origin = action.sub_section

            if action.action == 'CREATE':
                # TODO: do the same thing we did in FlashCardAction.apply
                # and look up main sections at the end
                main_section = deck.main_sections.get(
                    universal_main_section_id=(
                        ss_origin.main_section.universal_main_section_id
                    ),
                )
                sub_sections_to_create.append(SubSection(
                    main_section=main_section,
                    title=ss_origin.title,
                    description=ss_origin.description,
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                ))
            elif action.action == 'EDIT':
                ss_destination = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__deck=deck,
                )  # TODO: find a way to prefetch this

                for attr in SubSection.EDITABLE_ATTRS:
                    setattr(ss_destination, attr, getattr(ss_origin, attr))

                sub_sections_to_edit.append(ss_destination)
            else:
                sub_section_uids_to_delete.append(ss_origin.universal_sub_section_id)

        return sub_sections_to_create, sub_sections_to_edit, sub_section_uids_to_delete

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
    def push(
        actions: QuerySet[FlashCardAction],
        snapshot: SnapShot,
    ):
        # NOTE: since FlashCards are not duplicated between snapshots
        # (unlike sections), this function is considerably different from
        # the other `Action.apply`s
        actions = actions.prefetch_related('flashcard__sub_sections').all()

        # Hold a dict of sub sections to the flashcards to link to them
        # key: universal_sub_section_id; val: flashcards to link to that sub section
        sub_sections_to_link_flashcards = defaultdict(list)

        flashcards_to_create = []
        origin_flashcards_to_update_uid = []

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

            # Update the action
            action.deck = None
            action.snapshot = snapshot

        FlashCard.objects.bulk_create(flashcards_to_create)

        # Note that the origin flashcards are now universally synced
        FlashCard.objects.bulk_update(
            origin_flashcards_to_update_uid,
            ('universal_flashcard_id',),
        )

        # Transfer the actions from the deck to the snapshot
        FlashCardAction.objects.bulk_update(
            actions,
            ('deck', 'snapshot', 'flashcard')
        )

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

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[
        List[FlashCard],
        List[FlashCard],
        List[str],
        List[ReviewInstance],
        dict,
    ]:
        actions = snapshot.applied_flashcardaction.prefetch_related(
            'flashcard__sub_sections',
        ).all()

        # Hold a dict of sub sections to the flashcards to link to them
        # key: universal_sub_section_id; val: flashcards to link to that sub section
        sub_sections_to_link_flashcards = defaultdict(list)

        flashcards_to_create = []
        flashcards_to_edit = []
        flashcard_uids_to_delete = []
        review_instances_to_create = []

        for action in actions:
            fc_origin = action.flashcard

            if action.action == 'CREATE':
                fc_destination, ris = fc_origin.copy(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                )

                flashcards_to_create.append(fc_destination)
                review_instances_to_create += ris
                sub_sections_to_link_flashcards[
                    fc_origin.sub_sections.first().universal_sub_section_id
                ].append(fc_destination)
            elif action.action == 'EDIT':
                fc_destination = FlashCard.objects.get(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                    subsections__main_section__deck=deck,
                )  # TODO: find a way to prefetch this

                for attr in FlashCard.EDITABLE_ATTRS:
                    setattr(fc_destination, attr, getattr(fc_origin, attr))

                flashcards_to_edit.append(fc_destination)
            else:
                flashcard_uids_to_delete.append(fc_origin.universal_flashcard_id)

        return (
            flashcards_to_create,
            flashcards_to_edit,
            flashcard_uids_to_delete,
            review_instances_to_create,
            sub_sections_to_link_flashcards,
        )

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
