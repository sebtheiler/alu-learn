from __future__ import annotations

import uuid
from typing import List, Literal, Tuple, Union

from accounts.models import User
from decks.models import Deck, FlashCard, FlashCardData, ReviewInstance
from django.db import models
from django.db.models.expressions import F
from django.db.models.query import QuerySet
from django.db.utils import IntegrityError
from profiles.models import Profile
from skill_tree.models import MainSection, SectionData, SubSection


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

    def has_view_access(self, author_pk: int):
        if self.view_access == 'PUBLIC' or self.is_owner(author_pk):
            return True
        elif self.view_access == 'FRIENDS':
            return Profile.objects.filter(
                friends__in=User.objects.filter(profile__in=self.owners.all()),
                pk=author_pk,
            ).exists()
        elif self.view_access == 'STUDENT':
            return Profile.objects.filter(
                classrooms_in__teachers__in=self.owners.all(),
                pk=author_pk,
            ).exists()

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
        elif self.edit_access == 'PUBLIC':
            return True

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

        # NOTE: these could be rewritten to use actions, but it is
        # inefficient since it implies having to apply every snapshot since creation
        # when we could just directly copy the latest snapshot

        # Copy tree
        main_sections_to_create = []
        sub_sections_to_create = []
        flashcards_to_create = []
        review_instances_to_create = []

        sections_data_to_create = []
        flashcards_data_to_create = []

        main_sections_to_copy = latest_snapshot.main_sections\
            .prefetch_related(
                'data',
                'sub_sections__data',
                'sub_sections__flashcards__data',
            )\
            .all()
        for main_section_to_copy in main_sections_to_copy:
            main_section_data, main_section = main_section_to_copy.copy(
                deck_id=deck.pk,
                create_new_data=True,
            )
            main_sections_to_create.append(main_section)
            sections_data_to_create.append(main_section_data)

            for sub_section_to_copy in main_section_to_copy.sub_sections.all():
                sub_section_data, sub_section = sub_section_to_copy.copy(
                    main_section_id=main_section.pk,
                    create_new_data=True,
                )
                sub_sections_to_create.append(sub_section)
                sections_data_to_create.append(sub_section_data)

                for flashcard_to_copy in sub_section_to_copy.flashcards.all():
                    flashcard_data, flashcard, review_instances = flashcard_to_copy.copy(
                        sub_section_id=sub_section.pk,
                        create_new_data=True,
                    )

                    flashcards_to_create.append(flashcard)
                    flashcards_data_to_create.append(flashcard_data)
                    review_instances_to_create += review_instances

        # Create objects
        SectionData.objects.bulk_create(sections_data_to_create)
        FlashCardData.objects.bulk_create(flashcards_data_to_create)

        MainSection.objects.bulk_create(main_sections_to_create)
        SubSection.objects.bulk_create(sub_sections_to_create)
        FlashCard.objects.bulk_create(flashcards_to_create)
        ReviewInstance.objects.bulk_create(review_instances_to_create)

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

        # Check owner access
        if not shared_deck.is_owner(author.pk):
            raise PermissionError('User does not have permission to edit')

        # Create new snapshot
        snapshot = SnapShot.create_child(
            parent=latest_snapshot,
            author=author,
            message=message,
            shared_deck_id=shared_deck.pk,

            # Instead of deleting models later, it is simpler never to include them
            # TODO: this looks weird; there should be a better way: look at SubmittedChanges.accept
            main_section_uids_to_remove=MainSection.objects.filter(
                deck_id=deck.pk,
                attached_action__action='DELETE',
            ).values_list('universal_main_section_id', flat=True),
            sub_section_uids_to_remove=SubSection.objects.filter(
                main_section__deck_id=deck.pk,
                attached_action__action='DELETE',
            ).values_list('universal_sub_section_id', flat=True),
            flashcard_uids_to_remove=FlashCard.objects.filter(
                sub_section__main_section__deck_id=deck.pk,
                attached_action__action='DELETE',
            ).values_list('universal_flashcard_id', flat=True),
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
    def submit_changes(
        deck: Deck,
        shared_deck: SharedDeck,
        author: Profile,
        message: str,
    ) -> SubmittedChanges:
        latest_snapshot = shared_deck.get_latest_snapshot()
        if deck.equivalent_to_snapshot != latest_snapshot:
            raise ValueError('Deck is not up to date')

        # Check edit access
        if not shared_deck.has_edit_access(author.pk):
            raise PermissionError('User does not have permission to edit')

        # Create new snapshot
        submitted_changes = SubmittedChanges.objects.create(
            author_id=author.pk,
            shared_deck_id=shared_deck.pk,
            message=message,
        )

        # Transfer actions
        submitted_changes.transfer_actions_from_deck(deck)

        return submitted_changes

    @staticmethod
    def pull(deck: Deck) -> Tuple[Deck, dict]:
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
            'applied_mainsectionactions__main_section',
            'applied_subsectionactions__sub_section',
            'applied_flashcardactions__flashcard',
        ).all()

        # Get the changes that need applying
        # main_sections_to_create = []
        # main_section_uids_to_delete = []

        # sub_sections_to_create = []
        # sub_section_uids_to_delete = []

        # sections_data_to_create = []
        # sections_data_to_edit = []

        # flashcards_to_create = []
        # flashcard_uids_to_delete = []
        # review_instances_to_create = []
        # # TODO: edit review instances when cloze is edited

        # flashcards_data_to_create = []
        # flashcards_data_to_edit = []

        conflicts = {
            'main_sections': [],
            'sub_sections': [],
            'flashcards': [],
        }

        for snapshot in snapshots_to_apply:
            # === Copy main sections ===
            (
                mss_to_create,
                mss_to_edit,
                ms_uids_to_del,

                ms_s_data_to_create,
                ms_s_data_to_edit,

                ms_conflicts,
            ) = MainSectionAction.pull(
                snapshot,
                deck,
            )

            # Create/edit main sections
            SectionData.objects.bulk_create(ms_s_data_to_create)
            SectionData.objects.bulk_update(
                ms_s_data_to_edit,
                SectionData.EDITABLE_ATTRS,
            )
            MainSection.objects.bulk_update(
                mss_to_edit,
                ('order_num',),
            )

            # Create/delete main sections
            MainSection.objects.bulk_create(mss_to_create)
            MainSection.objects.filter(
                deck_id=deck.pk,
                universal_main_section_id__in=ms_uids_to_del,
            ).delete()

            # === Copy sub sections ===
            (
                sss_to_create,
                sss_to_edit,
                ss_uids_to_del,

                ss_s_data_to_create,
                ss_s_data_to_edit,

                ss_conflicts,
            ) = SubSectionAction.pull(
                snapshot,
                deck,
            )

            # Create/edit sub sections data
            SectionData.objects.bulk_create(ss_s_data_to_create)
            SectionData.objects.bulk_update(
                ss_s_data_to_edit,
                SectionData.EDITABLE_ATTRS,
            )
            SubSection.objects.bulk_update(
                sss_to_edit,
                ('order_num',),
            )

            # Create/delete sub sections
            SubSection.objects.bulk_create(sss_to_create)
            SubSection.objects.filter(
                main_section__deck_id=deck.pk,
                universal_sub_section_id__in=ss_uids_to_del,
            ).delete()

            # === Copy flashcards ===
            (
                fcs_to_create,
                fcs_to_edit,
                fc_uids_to_del,
                ris_to_create,

                f_data_to_create,
                f_data_to_edit,

                fc_conflicts,
            ) = FlashCardAction.pull(
                snapshot,
                deck,
            )

            # Create/edit flashcard data
            FlashCardData.objects.bulk_create(f_data_to_create)
            FlashCardData.objects.bulk_update(
                f_data_to_edit,
                FlashCardData.EDITABLE_ATTRS,
            )
            FlashCard.objects.bulk_update(
                fcs_to_edit,
                ('order_num',),
            )

            # Create/delete flashcards and review instances
            FlashCard.objects.bulk_create(fcs_to_create)
            FlashCard.objects.filter(
                sub_section__main_section__deck_id=deck.pk,
                universal_flashcard_id__in=fc_uids_to_del,
            ).delete()
            ReviewInstance.objects.bulk_create(ris_to_create)

            # === Add to conflicts ===
            conflicts['main_sections'] += ms_conflicts
            conflicts['sub_sections'] += ss_conflicts
            conflicts['flashcards'] += fc_conflicts

        # Update deck
        deck.equivalent_to_snapshot = latest_snapshot
        deck.is_updating = False
        deck.save()

        return deck, conflicts


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
        main_section_uids_to_remove: List[str] = [],
        sub_section_uids_to_remove: List[str] = [],
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
        flashcards = []

        for ms_to_copy in parent.main_sections.all():
            if ms_to_copy.universal_main_section_id in main_section_uids_to_remove:
                continue

            _, copied_ms = ms_to_copy.copy(
                child.pk,
                create_new_data=False,
            )
            main_sections.append(copied_ms)

            for ss_to_copy in ms_to_copy.sub_sections.all():
                if ss_to_copy.universal_sub_section_id in sub_section_uids_to_remove:
                    continue

                _, copied_ss = ss_to_copy.copy(
                    copied_ms.pk,
                    create_new_data=False,
                )
                sub_sections.append(copied_ss)

                for fc_to_copy in ss_to_copy.flashcards.all():
                    if fc_to_copy.universal_flashcard_id in flashcard_uids_to_remove:
                        continue

                    _, copied_fc, _ = fc_to_copy.copy(
                        copied_ss.pk,
                        skip_creating_review_instances=True,
                        create_new_data=False,
                    )
                    flashcards.append(copied_fc)

        # Create new objects
        MainSection.objects.bulk_create(main_sections)
        SubSection.objects.bulk_create(sub_sections)
        FlashCard.objects.bulk_create(flashcards)

        return child


class SubmittedChanges(models.Model):
    author = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='authored_submitted_changes',
    )
    shared_deck = models.ForeignKey(
        SharedDeck,
        on_delete=models.CASCADE,
        related_name='submitted_changes',
    )
    created_from_deck = models.ForeignKey(
        Deck,
        on_delete=models.SET_NULL,
        related_name='submitted_changes',
        null=True, blank=True,
    )

    message = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def transfer_actions_from_deck(self, deck: Deck) -> SubmittedChanges:
        deck.mainsectionactions.update(
            deck=None,
            submitted_changes=self,
        )
        deck.subsectionactions.update(
            deck=None,
            submitted_changes=self,
        )
        deck.flashcardactions.update(
            deck=None,
            submitted_changes=self,
        )

        return self

    def transfer_actions_to_deck(self, deck: Deck) -> Deck:
        self.pending_mainsectionactions.update(
            deck=deck,
            submitted_changes=None,
        )
        self.pending_subsectionactions.update(
            deck=deck,
            submitted_changes=None,
        )
        self.pending_flashcardactions.update(
            deck=None,
            submitted_changes=self,
        )

        return deck

    def accept(self) -> None:
        latest_snapshot = self.shared_deck.get_latest_snapshot()

        snapshot = SnapShot.create_child(
            parent=latest_snapshot,
            author=self.author,
            message=self.message,
            shared_deck_id=self.shared_deck_id,

            # Instead of deleting models later, it is simpler never to include them
            main_section_uids_to_remove=self.pending_mainsectionactions.filter(
                action='DELETE',
            ).values_list('universal_main_section_id', flat=True),
            sub_section_uids_to_remove=self.pending_subsectionactions.filter(
                action='DELETE',
            ).values_list('universal_sub_section_id', flat=True),
            flashcard_uids_to_remove=self.pending_flashcardactions.filter(
                action='DELETE',
            ).values_list('universal_flashcard_id', flat=True),
        )

        # Apply actions
        MainSectionAction.push(
            self.pending_mainsectionactions,
            snapshot,
        )
        SubSectionAction.push(
            self.pending_subsectionactions,
            snapshot,
        )
        FlashCardAction.push(
            self.pending_flashcardactions,
            snapshot,
        )

        # Update the deck this was created from and delete self
        self.created_from_deck.equivalent_to_snapshot = snapshot
        self.created_from_deck.save()
        self.delete()

        return snapshot

    def deny(self) -> None:
        # Log these actions as being part of the original deck again
        if self.created_from_deck_id:
            self.transfer_actions_to_deck(self.created_from_deck)
        else:
            # If there is no deck to transfer back to, the actions are lost forever
            self.pending_mainsectionactions.delete()
            self.pending_subsectionactions.delete()
            self.pending_flashcardactions.delete()

        # Delete self
        self.delete()


class AbstractAction(models.Model):
    # Each action must either have a Deck, a SnapShot, or a SubmittedChanges (XOR)
    # Actions are initially attached to a Deck, but when that Deck is synced
    # with a SharedDeck, they are transfered to a
    # SnapShot (from an owner) or a SubmittedChanges (from a non-owner editor)
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
        related_name='applied_%(class)ss',
        related_query_name='applied_%(class)ss',
    )
    submitted_changes = models.ForeignKey(
        SubmittedChanges,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='pending_%(class)ss',
        related_query_name='pending_%(class)ss',
    )

    ACTION_OPTIONS = (
        ('CREATE', 'Create'),
        ('EDIT', 'Edit'),
        ('DELETE', 'Delete'),
        ('REARRANGE', 'Rearrange'),
    )
    ACTION_TYPE = Literal['CREATE', 'EDIT', 'DELETE', 'REARRANGE']
    action = models.CharField(max_length=10, choices=ACTION_OPTIONS)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ('timestamp',)

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
    # or additions), or a universal flashcard ID: XOR
    main_section = models.OneToOneField(
        MainSection,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='attached_action',
    )
    universal_main_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def push(actions: QuerySet[MainSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('main_section__data').all()

        main_sections_to_create = []
        main_sections_data_to_create = []
        # main_sections_to_link_data = {}
        main_sections_to_edit = []
        origin_mainsections_to_update_uid = []

        for action in actions:
            ms_origin = action.main_section
            ms_destination = None  # set in CREATE/EDIT; not DELETE

            if action.action == 'CREATE':
                ms_data, ms_destination = ms_origin.copy(
                    snapshot_id=snapshot.pk,
                    universal_main_section_id=ms_origin.pk,
                    create_new_data=True,
                )
                main_sections_to_create.append(ms_destination)
                main_sections_data_to_create.append(ms_data)

                # Note that the origin main section is now universally synced
                ms_origin.universal_main_section_id = ms_origin.pk
                origin_mainsections_to_update_uid.append(ms_origin)

                # TODO: maybe try to create all sub sections under this MS right now??
            elif action.action == 'EDIT':
                data_id = uuid.uuid4()
                ms_data = SectionData(
                    title=ms_origin.data.title,
                    description=ms_origin.data.description,
                    pk=data_id,
                )
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    snapshot=snapshot,
                )  # TODO: find a way to prefetch this
                ms_destination.data_id = data_id
                # main_sections_to_link_data[ms_origin.universal_main_section_id] = ms_data

                main_sections_to_edit.append(ms_destination)
                main_sections_data_to_create.append(ms_data)
            elif action.action == 'DELETE':
                # NOTE: deleted MainSections are never included, so we only have to
                # rearrange the MainSections that come after this one; not delete the original
                MainSection.objects.filter(
                    order_num__gt=ms_origin.order_num,
                    snapshot_id=snapshot.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    snapshot=snapshot,
                )  # TODO: find a way to prefetch this
                ms_destination.order_num = ms_origin.order_num

                main_sections_to_edit.append(ms_destination)
            else:
                raise ValueError(f'Unknown action: {action.action}, {action}')

            # Update the action
            action.deck = None
            action.submitted_changes = None
            action.snapshot = snapshot
            if ms_destination is not None:
                action.main_section = ms_destination

        SectionData.objects.bulk_create(main_sections_data_to_create)
        MainSection.objects.bulk_create(main_sections_to_create)

        # TODO: get this working
        # # Link edited main sections to their section datas
        # # NOTE: we do this at the end so that we can get all the main sections
        # # with a single DB query, rather than querying a main section for each
        # # edited main section
        # for universal_main_section_id, data in main_sections_to_link_data.items():
        #     ms_destination = MainSection.objects.get(
        #         universal_main_section_id=universal_main_section_id,
        #         snapshot=snapshot,
        #     )  # TODO: find a way to prefetch this
        #     ms_destination.data_id = data.pk
        MainSection.objects.bulk_update(
            main_sections_to_edit,
            ('data_id', 'order_num'),
        )

        # Note that the origin main sections are now universally synced
        MainSection.objects.bulk_update(
            origin_mainsections_to_update_uid,
            ('universal_main_section_id',),
        )

        # Transfer the actions from the deck to the snapshot
        MainSectionAction.objects.bulk_update(
            actions,
            ('deck', 'submitted_changes', 'snapshot', 'main_section'),
        )

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[
        List[MainSection],
        List[MainSection],
        List[str],

        List[SectionData],
        List[SectionData],

        List[Tuple[MainSection, MainSection]],
    ]:
        actions = snapshot.applied_mainsectionactions.prefetch_related(
            'main_section__data',
        ).all()

        main_sections_to_create = []
        main_sections_to_edit = []
        main_section_uids_to_delete = []

        sections_data_to_create = []
        sections_data_to_edit = []

        conflicts = []

        for action in actions:
            ms_origin = action.main_section

            if action.action == 'CREATE':
                copied_data, copied_ms = ms_origin.copy(deck_id=deck.pk, create_new_data=True)
                main_sections_to_create.append(copied_ms)
                sections_data_to_create.append(copied_data)
            elif action.action == 'EDIT':
                ms_destination = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    deck_id=deck.pk,
                )  # TODO: find a way to prefetch this

                # Test if there is an attached action (i.e., there is a conflict)
                if hasattr(ms_destination, 'attached_action'):
                    conflicts.append((ms_origin, ms_destination))
                    continue

                # Edit data
                ms_data = ms_destination.data
                ms_data.pull(ms_origin.data)
                sections_data_to_edit.append(ms_data)
            elif action.action == 'DELETE':
                main_section_uids_to_delete.append(ms_origin.universal_main_section_id)
                MainSection.objects.filter(
                    order_num__gt=ms_origin.order_num,
                    deck_id=deck.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                main_section = MainSection.objects.get(
                    universal_main_section_id=ms_origin.universal_main_section_id,
                    deck_id=deck.pk,
                )
                main_section.order_num = ms_origin.order_num

                main_sections_to_edit.append(main_section)
            else:
                raise ValueError(f'Unknown action: {action}')

        return (
            main_sections_to_create,
            main_sections_to_edit,
            main_section_uids_to_delete,

            sections_data_to_create,
            sections_data_to_edit,

            conflicts,
        )

    @staticmethod
    def create_action(action: AbstractAction.ACTION_TYPE, main_section: MainSection):
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
            # Create a CREATE/EDIT/REARRANGE action
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
    # or additions), or a universal flashcard ID: XOR
    sub_section = models.OneToOneField(
        SubSection,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='attached_action',
    )
    universal_sub_section_id = models.UUIDField(null=True, blank=True)

    @staticmethod
    def push(actions: QuerySet[SubSectionAction], snapshot: SnapShot):
        actions = actions.prefetch_related('sub_section__main_section', 'sub_section__data').all()

        sub_sections_to_create = []
        sub_sections_data_to_create = []
        sub_sections_to_edit = []
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
                ss_data, ss_destination = ss_origin.copy(
                    main_section_id=main_section.pk,
                    universal_sub_section_id=ss_origin.pk,
                    create_new_data=True,
                )
                sub_sections_to_create.append(ss_destination)
                sub_sections_data_to_create.append(ss_data)

                # Note that the sub section is now universally synced
                ss_origin.universal_sub_section_id = ss_origin.pk
                origin_subsections_to_update_uid.append(ss_origin)
            elif action.action == 'EDIT':
                data_id = uuid.uuid4()
                ss_data = SectionData(
                    title=ss_origin.data.title,
                    description=ss_origin.data.description,
                    pk=data_id,
                )
                ss_destination = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__snapshot_id=snapshot.pk,
                )  # TODO: find a way to prefetch this
                ss_destination.data_id = data_id

                sub_sections_to_edit.append(ss_destination)
                sub_sections_data_to_create.append(ss_data)
            elif action.action == 'DELETE':
                # NOTE: deleted SubSections are never included, so we only have to
                # rearrange the SubSections that come after this one; not delete the original
                SubSection.objects.filter(
                    order_num__gt=ss_origin.order_num,
                    main_section__snapshot_id=snapshot.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                ss_destination = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__snapshot_id=snapshot.pk,
                )  # TODO: find a way to prefetch this
                ss_destination.order_num = ss_origin.order_num

                sub_sections_to_edit.append(ss_destination)
            else:
                raise ValueError(f'Unknown action: {action.action}, {action}')

            # Update the action
            action.deck = None
            action.submitted_changes = None
            action.snapshot = snapshot
            if ss_destination:
                action.sub_section = ss_destination

        SectionData.objects.bulk_create(sub_sections_data_to_create)
        SubSection.objects.bulk_create(sub_sections_to_create)
        SubSection.objects.bulk_update(
            sub_sections_to_edit,
            ('data_id', 'order_num'),
        )

        # Note that the origin sub sections are now universally synced
        SubSection.objects.bulk_update(
            origin_subsections_to_update_uid,
            ('universal_sub_section_id',),
        )

        # Transfer the actions from the deck to the snapshot
        SubSectionAction.objects.bulk_update(
            actions,
            ('deck', 'submitted_changes', 'snapshot', 'sub_section'),
        )

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[
        List[SubSection],
        List[SubSection],
        List[str],

        List[SectionData],
        List[SectionData],

        List[Tuple[SectionData, SectionData]],
    ]:
        actions = snapshot.applied_subsectionactions.prefetch_related(
            'sub_section__main_section',
            'sub_section__data',
        ).all()

        sub_sections_to_create = []
        sub_sections_to_edit = []
        sub_section_uids_to_delete = []

        sections_data_to_create = []
        sections_data_to_edit = []

        conflicts = []

        for action in actions:
            ss_origin = action.sub_section

            if action.action == 'CREATE':
                # TODO: find a way to prefetch this
                main_section = deck.main_sections.get(
                    universal_main_section_id=(
                        ss_origin.main_section.universal_main_section_id
                    ),
                )

                copied_data, copied_ss = ss_origin.copy(
                    main_section_id=main_section.pk,
                    create_new_data=True,
                )

                sub_sections_to_create.append(copied_ss)
                sections_data_to_create.append(copied_data)
            elif action.action == 'EDIT':
                ss_destination = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__deck_id=deck.pk,
                )  # TODO: find a way to prefetch this

                # Test if there is an attached action (i.e., there is a conflict)
                if hasattr(ss_destination, 'attached_action'):
                    conflicts.append((ss_origin, ss_destination))
                    continue

                # Edit data
                ss_data = ss_destination.data
                ss_data.pull(ss_origin.data)
                sections_data_to_edit.append(ss_data)
            elif action.action == 'DELETE':
                sub_section_uids_to_delete.append(ss_origin.universal_sub_section_id)
                SubSection.objects.filter(
                    order_num__gt=ss_origin.order_num,
                    main_section__deck_id=deck.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                sub_section = SubSection.objects.get(
                    universal_sub_section_id=ss_origin.universal_sub_section_id,
                    main_section__deck_id=deck.pk,
                )
                sub_section.order_num = ss_origin.order_num

                sub_sections_to_edit.append(sub_section)
            else:
                raise ValueError(f'Unknown action: {action}')

        return (
            sub_sections_to_create,
            sub_sections_to_edit,
            sub_section_uids_to_delete,

            sections_data_to_create,
            sections_data_to_edit,

            conflicts,
        )

    @staticmethod
    def create_action(
        action: AbstractAction.ACTION_TYPE,
        sub_section: SubSection,
        deck_id: int = None,
    ):
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
            # Create a CREATE/EDIT/REARRANGE action
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
        actions = actions.prefetch_related('flashcard__sub_section', 'flashcard__data').all()

        flashcards_to_create = []
        flashcards_data_to_create = []
        flashcards_to_edit = []
        origin_flashcards_to_update_uid = []

        for action in actions:
            fc_origin = action.flashcard
            fc_destination = None

            if action.action == 'CREATE':
                sub_section = SubSection.objects.get(
                    main_section__snapshot_id=snapshot.pk,
                    universal_sub_section_id=(
                        fc_origin.sub_section.universal_sub_section_id
                    ),
                )
                fc_data, fc_destination, _ = fc_origin.copy(
                    sub_section_id=sub_section.pk,
                    skip_creating_review_instances=True,
                    universal_flashcard_id=fc_origin.pk,
                    create_new_data=True,
                )
                flashcards_to_create.append(fc_destination)
                flashcards_data_to_create.append(fc_data)

                # Note that the origin flashcard is now universally synced
                fc_origin.universal_flashcard_id = fc_origin.pk
                origin_flashcards_to_update_uid.append(fc_origin)
            elif action.action == 'EDIT':
                fc_data = fc_origin.data.copy()
                fc_destination = FlashCard.objects.get(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                    sub_section__main_section__snapshot_id=snapshot.pk,
                )
                fc_destination.data_id = fc_data.pk

                flashcards_to_edit.append(fc_destination)
                flashcards_data_to_create.append(fc_data)
            elif action.action == 'DELETE':
                # NOTE: deleted FlashCards are never included, so we only have to
                # rearrange the FlashCards that come after this one; not delete the original
                FlashCard.objects.filter(
                    order_num__gt=fc_origin.order_num,
                    sub_section__main_section__snapshot_id=snapshot.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                fc_destination = FlashCard.objects.get(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                    sub_section__main_section__snapshot_id=snapshot.pk,
                )  # TODO : find a way to prefetch this
                fc_destination.order_num = fc_origin.order_num

                flashcards_to_create.append(fc_destination)
            else:
                raise ValueError(f'Unknown action: {action.action}, {action}')

            # Update the action
            action.deck = None
            action.submitted_changes = None
            action.snapshot = snapshot
            action.flashcard_id = fc_destination.pk

        FlashCardData.objects.bulk_create(flashcards_data_to_create)
        FlashCard.objects.bulk_create(flashcards_to_create)
        FlashCard.objects.bulk_update(
            flashcards_to_edit,
            ('data_id', 'order_num'),
        )

        # Note that the origin flashcards are now universally synced
        FlashCard.objects.bulk_update(
            origin_flashcards_to_update_uid,
            ('universal_flashcard_id',),
        )

        # Transfer the actions from the deck to the snapshot
        FlashCardAction.objects.bulk_update(
            actions,
            ('deck', 'submitted_changes', 'snapshot', 'flashcard_id')
        )

    @staticmethod
    def pull(
        snapshot: SnapShot,
        deck: Deck,
    ) -> Tuple[
        List[FlashCard],
        List[FlashCard],
        List[str],
        List[ReviewInstance],

        List[FlashCardData],
        List[FlashCardData],

        List[Tuple[FlashCard, FlashCard]],
    ]:
        actions = snapshot.applied_flashcardactions.prefetch_related(
            'flashcard__sub_section',
            'flashcard__data'
        ).all()

        flashcards_to_create = []
        flashcards_to_edit = []
        flashcard_uids_to_delete = []
        review_instances_to_create = []

        flashcards_data_to_create = []
        flashcards_data_to_edit = []

        conflicts = []

        for action in actions:
            fc_origin = action.flashcard

            if action.action == 'CREATE':
                # TODO: find a way to prefetch this
                sub_section = SubSection.objects.get(
                    main_section__deck_id=deck.pk,
                    universal_sub_section_id=(
                        fc_origin.sub_section.universal_sub_section_id
                    ),
                )

                fc_data, fc_destination, ris = fc_origin.copy(sub_section.pk, create_new_data=True)

                flashcards_to_create.append(fc_destination)
                review_instances_to_create += ris
                flashcards_data_to_create.append(fc_data)
            elif action.action == 'EDIT':
                fc_destination = FlashCard.objects.get(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                    sub_section__main_section__deck_id=deck.pk,
                )  # TODO: find a way to prefetch this

                # Test if there is an attached action (i.e., there is a conflict)
                if hasattr(fc_destination, 'attached_action'):
                    conflicts.append((fc_origin, fc_destination))
                    continue

                # Edit data
                fc_data = fc_destination.data
                fc_data.pull(fc_origin.data)
                flashcards_data_to_edit.append(fc_data)
            elif action.action == 'DELETE':
                flashcard_uids_to_delete.append(fc_origin.universal_flashcard_id)
                FlashCard.objects.filter(
                    order_num__gt=fc_origin.order_num,
                    sub_section__main_section__deck_id=deck.pk,
                ).update(
                    order_num=F('order_num') - 1,
                )  # TODO: there is surely a better way to do this
            elif action.action == 'REARRANGE':
                flashcard = FlashCard.objects.get(
                    universal_flashcard_id=fc_origin.universal_flashcard_id,
                    sub_section__main_section__deck_id=deck.pk,
                )
                flashcard.order_num = fc_origin.order_num

                flashcards_to_edit.append(flashcard)
            else:
                raise ValueError(f'Unknown action: {action}')

        return (
            flashcards_to_create,
            flashcards_to_edit,
            flashcard_uids_to_delete,
            review_instances_to_create,

            flashcards_data_to_create,
            flashcards_data_to_edit,

            conflicts,
        )

    @staticmethod
    def create_action(
        action: AbstractAction.ACTION_TYPE,
        flashcard: FlashCard,
        deck_id: int = None,
    ):
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
                    deck_id=deck_id or flashcard.sub_section.main_section.deck_id,
                    action=action,
                    universal_flashcard_id=flashcard.universal_flashcard_id,
                )
            else:
                return

        try:
            # Create a CREATE/EDIT/REARRANGE action
            return FlashCardAction.objects.create(
                deck_id=deck_id or flashcard.sub_section.main_section.deck_id,
                action=action,
                flashcard=flashcard,
            )
        except IntegrityError:
            # If creating an EDIT action, and there is already a CREATE action, pass
            pass
