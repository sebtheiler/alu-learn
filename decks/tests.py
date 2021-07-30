import datetime as dt
import time
from typing import Callable, List, Tuple

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db.models.query import QuerySet
from profiles.models import ProfileHistorySegment
from selenium.common.exceptions import NoSuchElementException
from utils import ImprovedTestCase, SeleniumTestCase, create_slate_element, get_morning

from .api import views as api_views
from .models import (CustomStudySessionManager, Deck, DeckStudySessionManager,
                     ReviewInstance, FlashCard, FlashCardTypes, SharedDeck)

User = get_user_model()


class DeckTestCase(ImprovedTestCase):
    def create_deck(
        self,
        title: str,
        user: User = None,
        num_flashcards: int = None,
        str_tags: bool = False,
    ) -> Deck:
        deck = Deck.objects.create(
            user=user or self.user,
            title=title,
        )

        characters = 'abcdefhijklmnopqrstuvwxyz~!@#$%^&*()_+-=[]|/?.>,<'
        if num_flashcards:
            for i in range(num_flashcards):
                if str_tags:
                    tags = f'{characters[i]}, {characters[i + 1]}, {characters[i + 2]}'
                else:
                    tags = f'{i}, {i + 1}, {i + 2}'
                FlashCard.create_flashcard(
                    deck,
                    tags,
                    'basic',
                    [create_slate_element(str(i)), create_slate_element(str(i + 1))],
                )

        return deck

    def _test_decks_equal(
        self,
        deck1: Deck,
        deck2: Deck,
        test_review_instances_exists: bool = True,
        test_review_instances_equal: bool = True,
    ) -> Tuple[bool, str]:
        deck1_flashcards = deck1.flashcards.all()
        deck2_flashcards = deck2.flashcards.all()
        if deck1_flashcards.count() != deck2_flashcards.count():
            return False, f'Deck\'s flashcard counts differ:\
                {deck1_flashcards.count()} vs {deck2_flashcards.count()}'

        for deck1_flashcard, deck2_flashcard in zip(deck2_flashcards, deck1_flashcards):
            # Assert flash cards are equal
            if deck1_flashcard.flashcard_num != deck2_flashcard.flashcard_num:
                return False, f'`flashcard_num`s differ:\
                    {deck1_flashcard.flashcard_num} vs {deck2_flashcard.flashcard_num}'
            if deck1_flashcard.flashcard_type != deck2_flashcard.flashcard_type:
                return False, f'`flashcard_type`s differ:\
                    {deck1_flashcard.flashcard_type} vs {deck2_flashcard.flashcard_type}'
            if deck1_flashcard.tags != deck2_flashcard.tags:
                return False, f'`tags`s differ:\
                    {deck1_flashcard.tags} vs {deck2_flashcard.tags}'
            if deck1_flashcard.fields != deck2_flashcard.fields:
                return False, f'`fields`s differ:\
                    {deck1_flashcard.fields} vs {deck2_flashcard.fields}'

            # Assert FlashCards are equal
            if not test_review_instances_exists:
                continue

            deck1_review_instances = deck1_flashcard.review_instances.all()
            deck2_review_instances = deck2_flashcard.review_instances.all()
            if deck1_review_instances.count() != deck2_review_instances.count():
                return False, f'NUmber of review instances differ:\
                    {deck1_review_instances.count()} vs {deck2_review_instances.count()}'

            if not test_review_instances_equal:
                continue

            attrs = [
                'content_indicies', 'name', 'learning_status',
                'steps_index', 'ease', 'interval',
                'is_suspended', 'leech_index',
            ]
            for deck1_ri, deck2_ri in zip(deck1_review_instances, deck2_review_instances):
                for attr in attrs:
                    if getattr(deck1_ri, attr) != getattr(deck2_ri, attr):
                        return False, f'`{attr}`s differ:\
                            {getattr(deck1_ri, attr)} vs {getattr(deck1_ri, attr)}'

        return True, 'Decks are equal'

    def assertDecksEqual(
        self,
        deck1: Deck,
        deck2: Deck,
        test_review_instances_exists: bool = True,
        test_review_instances_equal: bool = True,
    ):
        self.assertTrue(*self._test_decks_equal(
            deck1,
            deck2,
            test_review_instances_exists,
            test_review_instances_equal,
        ))

    def assertDecksNotEqual(
        self,
        deck1: Deck,
        deck2: Deck,
        test_review_instances_exists: bool = True,
        test_review_instances_equal: bool = True,
    ):
        self.assertFalse(*self._test_decks_equal(
            deck1,
            deck2,
            test_review_instances_exists,
            test_review_instances_equal,
        ))

    def test_create_deck_api(self):
        api_path = '/api/decks/create/'

        response = self.post_response(api_path, api_views.deck_create_view, {
            'title': 'My deck',
            'shuffle_unseen_cards': True,
            'daily_new_card_limit': 25,
            'scheduling_algorithm': 'ANKI',
            'difficulty': 'NORM',
        }, user=self.user)
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['title'], 'My deck')
        self.assertEqual(response.data['shuffle_unseen_cards'], True)
        self.assertEqual(response.data['daily_new_card_limit'], 25)
        self.assertEqual(response.data['scheduling_algorithm'], 'ANKI')
        self.assertEqual(response.data['difficulty'], 'NORM')
        deck = Deck.objects.get(pk=response.data['id'])
        self.assertEqual(deck.title, 'My deck')
        self.assertEqual(deck.study_session_manager.daily_new_card_limit, 25)

    def _flashcard_create_api_wrapper(
        self,
        fields: List[list],
        tags: str,
        flashcard_type: str,
        /,
        expected_content_indicies: List[list],  # e.g, [[0, 1], [1, 0]]
    ):
        deck = self.create_deck('Deck')
        self.assertEqual(deck.flashcards.count(), 0)

        # Create card
        response = self.post_response('', api_views.flashcard_create_view, {
            'fields': fields,
            'tags': tags,
            'flashcard_type': flashcard_type,
        }, kwargs={'deck_id': deck.pk})
        self.assertEqual(response.status_code, 201)

        # Test deck props
        self.assertEqual(deck.flashcards.count(), 1)

        # Test flashcard props
        flashcard = deck.flashcards.first()
        self.assertEqual(flashcard.fields, fields)
        self.assertEqual(flashcard.tags, tags)
        self.assertEqual(flashcard.flashcard_type, flashcard_type)

        # Test review instance props
        review_instances = flashcard.review_instances.all()
        self.assertEqual(review_instances.count(), len(expected_content_indicies))
        for i, review_instance in enumerate(review_instances):
            self.assertEqual(review_instance.content_indicies, expected_content_indicies[i])
            if flashcard_type == 'cloze':
                self.assertEqual(review_instance.name, f'cloze-{i+1}')

    def test_flashcard_create_api_basic(self):
        self._flashcard_create_api_wrapper(
            [create_slate_element('front'), create_slate_element('back')],
            'a, b, c',
            'basic',
            expected_content_indicies=[[0, 1]],
        )

    def test_flashcard_create_api_reversed(self):
        self._flashcard_create_api_wrapper(
            [create_slate_element('front'), create_slate_element('back')],
            'a, b, c',
            'reversed',
            expected_content_indicies=[[0, 1], [1, 0]],
        )

    def test_flashcard_create_api_cloze(self):
        self._flashcard_create_api_wrapper(
            [create_slate_element('{{c1::abc}} {{c2::def}} {{c3::ghi}}')],
            'a, b, c',
            'cloze',
            expected_content_indicies=[[0], [0], [0]],
        )

    def test_flashcard_create_func(self):
        deck = self.create_deck('Test')
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 0)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 0)
        flashcard = FlashCard.create_flashcard(
            deck,
            'a, b, c',
            'basic',
            [create_slate_element('a'), create_slate_element('b')],
        )[0]
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 1)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 1)
        self.assertEqual(flashcard.ease, 250)
        self.assertEqual(flashcard.flashcard.flashcard_num, 0)

    def test_flashcard_edit_api(self):
        api_view = api_views.flashcard_edit_view

        def edit_flashcard(
            flashcard_type: FlashCardTypes,
            fields: List[list],
            fields_edited: List[list],
            expected_reviews_initial: int,
            expected_reviews_finish: int,
        ):
            deck = self.create_deck(f'Edit test - {flashcard_type}')
            review_instance = FlashCard.create_flashcard(
                deck,
                'a, b, c',
                flashcard_type,
                fields,
            )[0]
            api_path = f'/api/decks/{deck.pk}/flashcards/{review_instance.flashcard.id}/edit/'
            self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 1)
            self.assertEqual(
                ReviewInstance.objects.filter(flashcard__deck=deck).count(),
                expected_reviews_initial,
            )
            self.assertEqual(review_instance.flashcard.tags, 'a, b, c')
            self.assertEqual(review_instance.flashcard.flashcard_type, flashcard_type)
            self.assertEqual(review_instance.flashcard.fields, fields)

            response = self.post_response(
                api_path,
                api_view,
                data={
                    'fields': fields_edited,
                    'tags': '1, 2, 3',
                },
                kwargs={
                    'deck_id': deck.id,
                    'flashcard_num': review_instance.flashcard.flashcard_num
                },
            )
            review_instance = ReviewInstance.objects.get(pk=review_instance.pk)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 1)
            self.assertEqual(
                ReviewInstance.objects.filter(flashcard__deck=deck).count(),
                expected_reviews_finish,
            )
            self.assertEqual(review_instance.flashcard.tags, '1, 2, 3')
            self.assertEqual(review_instance.flashcard.flashcard_type, flashcard_type)
            self.assertEqual(
                review_instance.flashcard.fields,
                fields_edited,
            )
            review_instance.flashcard.delete()

        # Edit basic flashcard
        edit_flashcard(
            'basic',
            [create_slate_element('1'), create_slate_element('2')],
            [create_slate_element('3'), create_slate_element('4')],
            1, 1
        )

        # Edit reversed flashcard
        edit_flashcard(
            'reversed',
            [create_slate_element('1'), create_slate_element('2')],
            [create_slate_element('3'), create_slate_element('4')],
            2, 2
        )

        # Edit cloze flashcard
        edit_flashcard(
            'cloze',
            [create_slate_element(
                '{{c1::abc}} {{c2::def}} {{c3::ghi}}'
            )],
            [create_slate_element(
                '{{c1::abc}} {{c2::def}} {{c2::ghi}}'
            )],
            3, 2
        )

    def test_flashcard_delete_api(self):
        # Create deck and flashcard
        deck = self.create_deck('Test')
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 0)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 0)
        flashcards = [FlashCard.create_flashcard(
            deck,
            'a, b, c',
            'cloze',
            [create_slate_element(
                '{{c1::abc}} {{c2::def}} {{c3::ghi}}'
            )],
        )[0] for _ in range(10)]
        flashcard = flashcards[0]
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 10)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 30)
        api_path = f'/api/decks/{deck.pk}/flashcards/{flashcard.flashcard.flashcard_num}/delete/'
        api_view = api_views.flashcard_delete_view
        kwargs = {'deck_id': deck.id, 'flashcard_num': flashcard.flashcard.flashcard_num}

        def check_flashcard_number_correct_order(deck):
            for i, flashcard in enumerate(deck.flashcards.all()):
                self.assertEqual(flashcard.flashcard_num, i)
        check_flashcard_number_correct_order(deck)

        # Attempt to delete as non-owner
        response = self.post_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 400)
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 10)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 30)
        check_flashcard_number_correct_order(deck)

        # Delete flashcard
        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(FlashCard.objects.filter(deck=deck).count(), 9)
        self.assertEqual(ReviewInstance.objects.filter(flashcard__deck=deck).count(), 27)
        check_flashcard_number_correct_order(deck)

    def test_flashcard_detail_api(self):
        deck = self.create_deck('Detail Test')
        flashcard = FlashCard.create_flashcard(
            deck,
            'a, b, c',
            'basic',
            [create_slate_element('a'), create_slate_element('b')],
        )[0]
        api_path = f'/api/decks/{deck.pk}/flashcards/{flashcard.flashcard.flashcard_num}/'
        api_view = api_views.flashcard_detail_view

        # Attempt to get non-existant flashcard
        response = self.get_response(
            api_path,
            api_view,
            kwargs={'flashcard_num': 123456, 'deck_id': deck.id},
        )
        self.assertEqual(response.status_code, 404)

        # Attempt to get flashcard as non-owner
        response = self.get_response(
            api_path,
            api_view,
            kwargs={'flashcard_num': flashcard.flashcard.flashcard_num, 'deck_id': deck.id},
            user=self.users[1],
        )
        self.assertEqual(response.status_code, 404)

        # Get flashcard detail
        response = self.get_response(
            api_path,
            api_view,
            kwargs={'flashcard_num': flashcard.flashcard.flashcard_num, 'deck_id': deck.id},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], str(flashcard.flashcard.pk))
        self.assertEqual(response.data['parent_deck_id'], deck.pk)
        self.assertEqual(response.data['tags'], 'a, b, c')
        self.assertIsInstance(response.data['fields'], list)
        self.assertIsInstance(response.data['fields'][0], list)
        self.assertIsInstance(response.data['fields'][0][0], dict)
        self.assertEqual(
            response.data['fields'][0],
            create_slate_element('a'),
        )
        self.assertEqual(
            response.data['fields'][1],
            create_slate_element('b'),
        )

    def test_deck_shared_list_api(self):
        api_path = f'/api/decks/detail/{self.user.username}'
        api_view = api_views.deck_shared_list
        kwargs = {'username': self.user.username}

        # Test with no decks
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        # Create non-share deck
        deck = self.create_deck('Deck to share')
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        # Create shared deck
        public_shared_deck = deck.create_shared_deck('Public', '', sharing_setting='PUBLIC')
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Public')
        self.assertEqual(response.data[0]['id'], public_shared_deck.pk)

        # Create friend only deck
        friend_shared_deck = deck.create_shared_deck('Friend', '', sharing_setting='FRIENDS')
        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        # Add User1 as friend
        self.user.friends.add(self.users[1].profile)
        self.users[1].friends.add(self.user.profile)

        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['title'], 'Friend')
        self.assertEqual(response.data[0]['id'], friend_shared_deck.pk)
        self.assertEqual(response.data[1]['title'], 'Public')
        self.assertEqual(response.data[1]['id'], public_shared_deck.pk)

    def test_deck_private_list_api(self):
        # Tests the private list and homepage APIs, since they are almost identical
        api_path = '/api/decks/list/'
        api_view = api_views.deck_private_list

        # Get private decks
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)

        # Create deck
        deck = self.create_deck('Private deck')

        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertTrue(deck.pk, response.data[0]['id'])

        # Create shared deck
        deck.create_shared_deck('not private deck', '')

        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1, 'Shared deck counted as private')

        # Create CSSM
        cssm = CustomStudySessionManager.objects.create(
            user=self.user.profile,
            title='CSSM Home',
        )
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1, 'CSSM counted as deck')

        response = self.get_response(f'{api_path}?include_cssms=true', api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2, 'CSSM not counted as deck')
        self.assertEqual(cssm.pk, response.data[1]['id'])

    def test_deck_detail_api(self):
        deck = self.create_deck('Detail deck')
        api_view = api_views.deck_detail_view
        api_path = f'/api/decks/{deck.pk}/'
        kwargs = {'deck_id': deck.pk}

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['id'], deck.pk)

    def test_shared_deck_detail_api(self):
        deck = self.create_deck('Detail shared deck')
        shared_deck = deck.create_shared_deck('shared detail deck', '')
        api_view = api_views.shared_deck_detail_view
        api_path = f'/api/decks/shared/detail/{shared_deck.pk}/'
        kwargs = {'shared_deck_id': shared_deck.pk}

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['id'], shared_deck.pk)

    def test_deck_flashcards_api(self):
        deck = self.create_deck('Deck with flashcards', num_flashcards=283)
        api_view = api_views.deck_flashcards_view
        api_path = f'/api/decks/{deck.pk}/flashcards/'
        kwargs = {'deck_id': deck.pk}

        # Test normally
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 283)
        self.assertEqual(len(response.data['results']), 250)  # pagination
        self.assertIsNotNone(response.data['next'])
        first_flashcard = response.data['results'][0]

        # Test with limit
        response = self.get_response(f'{api_path}?limit=7', api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 283)
        self.assertEqual(len(response.data['results']), 7)  # pagination
        self.assertEqual(first_flashcard, response.data['results'][0])

        # Test reversed
        response = self.get_response(f'{api_path}?reverse=true', api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 283)
        self.assertEqual(len(response.data['results']), 250)  # pagination
        self.assertIsNotNone(response.data['next'])
        self.assertNotEqual(first_flashcard, response.data['results'][0])

    def test_deck_delete_api(self):
        deck = self.create_deck('Deck with flashcards', num_flashcards=7)
        api_view = api_views.deck_delete_view
        api_path = f'/api/decks/{deck.pk}/delete/'
        kwargs = {'deck_id': deck.pk}

        # Attempt to delete as different user
        response = self.post_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Deck.objects.filter(pk=deck.pk).exists())

        # Delete deck
        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Deck.objects.filter(pk=deck.pk).exists())

        # Attempt to delete again
        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 400)

    def test_deck_edit_api(self):
        deck = self.create_deck('Deck to edit')
        ssm = deck.study_session_manager  # type: DeckStudySessionManager
        api_view = api_views.deck_edit_view
        api_path = f'/api/decks/{deck.pk}/edit/'
        kwargs = {'deck_id': deck.pk}

        self.assertEqual(deck.title, 'Deck to edit')
        self.assertEqual(ssm.scheduling_algorithm, 'ANKING')
        self.assertEqual(ssm.shuffle_unseen_cards, False)
        self.assertEqual(ssm.daily_new_card_limit, 20)
        self.assertEqual(ssm.daily_seen_card_limit, 200)
        self.assertEqual(ssm.review_ahead_minutes, 120)
        self.assertEqual(ssm.difficulty, 'HARD')

        response = self.post_response(api_path, api_view, {
            'new_title': 'Edited deck',
            'scheduling_algorithm': 'ANKI',
            'shuffle_unseen_cards': True,
            'daily_new_card_limit': 25,
            'daily_seen_card_limit': 100,
            'review_ahead_minutes': 150,
            'difficulty': 'NORM',
        }, kwargs=kwargs)
        deck = Deck.objects.get(pk=deck.pk)
        ssm.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(deck.title, 'Edited deck')
        self.assertEqual(ssm.scheduling_algorithm, 'ANKI')
        self.assertEqual(ssm.shuffle_unseen_cards, True)
        self.assertEqual(ssm.daily_new_card_limit, 25)
        self.assertEqual(ssm.daily_seen_card_limit, 100)
        self.assertEqual(ssm.review_ahead_minutes, 150)
        self.assertEqual(ssm.difficulty, 'NORM')

    def test_flashcard_suspend_leech_api(self):
        deck = self.create_deck('Deck to edit', num_flashcards=1)
        review_instance = ReviewInstance.objects.filter(flashcard__deck=deck).first()
        api_view = api_views.flashcard_suspend_leech_view
        api_path = f'/api/decks/{deck.pk}/flashcards/{review_instance.pk}/suspend_or_leech/'
        kwargs = {'deck_id': deck.pk, 'flashcard_id': review_instance.pk}

        # Baseline
        self.assertEqual(review_instance.is_suspended, False)
        self.assertEqual(review_instance.is_leech(), False)

        # Suspend
        self.post_response(api_path, api_view, {'action': 'suspend'}, kwargs=kwargs)
        review_instance = ReviewInstance.objects.get(pk=review_instance.pk)
        self.assertEqual(review_instance.is_suspended, True)
        self.assertEqual(review_instance.is_leech(), False)

        # Unsuspend
        self.post_response(api_path, api_view, {'action': 'unsuspend'}, kwargs=kwargs)
        review_instance = ReviewInstance.objects.get(pk=review_instance.pk)
        self.assertEqual(review_instance.is_suspended, False)
        self.assertEqual(review_instance.is_leech(), False)

        # Leech
        self.post_response(api_path, api_view, {'action': 'leech'}, kwargs=kwargs)
        review_instance = ReviewInstance.objects.get(pk=review_instance.pk)
        self.assertEqual(review_instance.is_suspended, False)
        self.assertEqual(review_instance.is_leech(), True)

        # Unleech
        self.post_response(api_path, api_view, {'action': 'unleech'}, kwargs=kwargs)
        review_instance = ReviewInstance.objects.get(pk=review_instance.pk)
        self.assertEqual(review_instance.is_suspended, False)
        self.assertEqual(review_instance.is_leech(), False)

    def test_flashcard_search(self):
        num_flashcards = ReviewInstance.objects.filter(flashcard__deck__user=self.user).count()
        deck_1 = self.create_deck('Deck to search', num_flashcards=27, str_tags=True)
        deck_2 = self.create_deck('Another deck to search', num_flashcards=5, str_tags=True)
        flashcard = deck_1.flashcards.first().review_instances.first()  # type: ReviewInstance

        # Test no params
        flashcards = ReviewInstance.search_flashcards(
            self.user,
        )
        self.assertEqual(flashcards.count(), num_flashcards + 32)

        # Test deck ID
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
        )
        self.assertEqual(flashcards.count(), 32)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
        )
        self.assertEqual(flashcards.count(), 27)

        # Test tags
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
            tags='b',
        )
        self.assertEqual(flashcards.count(), 4)  # 2 in each deck

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
            tags='a AND b',
        )
        self.assertEqual(flashcards.count(), 2)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
            tags='a OR d',
        )
        self.assertEqual(flashcards.count(), 8)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
            tags='d AND NOT c',
        )
        self.assertEqual(flashcards.count(), 2)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk},{deck_2.pk}',
            tags='a AND NOT c AND e',
        )
        self.assertEqual(flashcards.count(), 0)

        # Test contains
        # FIXME: fix contains
        # flashcards = FlashCard.search_flashcards(
        #     self.user,
        #     deck_ids=f'{deck_1.pk}',
        #     contains='a',
        # )
        # self.assertEqual(flashcards.count(), 0)

        # Test suspended
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            suspended=True,
        )
        self.assertEqual(flashcards.count(), 0)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            suspended=False,
        )
        self.assertEqual(flashcards.count(), 27)

        flashcard.is_suspended = True
        flashcard.save()

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            suspended=True,
        )
        self.assertEqual(flashcards.count(), 1)

        # Test leech
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            leech=True,
        )
        self.assertEqual(flashcards.count(), 0)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            leech=False,
        )
        self.assertEqual(flashcards.count(), 27)

        flashcard.set_is_leech(True)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            leech=True,
        )
        self.assertEqual(flashcards.count(), 1)

        # Test learning status
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            learning_status='UNSEEN',
        )
        self.assertEqual(flashcards.count(), 27)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            learning_status='LEARNING',
        )
        self.assertEqual(flashcards.count(), 0)

        flashcard.learning_status = 'LEARNING'
        flashcard.save()

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            learning_status='LEARNING',
        )
        self.assertEqual(flashcards.count(), 1)

        # Test min ease
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            min_ease='240',
        )
        self.assertEqual(flashcards.count(), 27)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            min_ease='260',
        )
        self.assertEqual(flashcards.count(), 0)

        flashcard.ease = 270
        flashcard.save()

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            min_ease='260',
        )
        self.assertEqual(flashcards.count(), 1)

        # Test max ease
        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            max_ease='280',
        )
        self.assertEqual(flashcards.count(), 27)

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            max_ease='220',
        )
        self.assertEqual(flashcards.count(), 0)

        flashcard.ease = 210
        flashcard.save()

        flashcards = ReviewInstance.search_flashcards(
            self.user,
            deck_ids=f'{deck_1.pk}',
            max_ease='220',
        )
        self.assertEqual(flashcards.count(), 1)

    def test_deck_search_api(self):
        api_path = '/api/decks/search/'
        api_view = api_views.deck_search_view
        deck = self.create_deck('Deck to copy then search for')
        shared_deck = deck.create_shared_deck('Deck to search for', '')
        cache.clear()

        # Search for deck
        start = time.time()
        response = self.get_response(f'{api_path}?q=Deck%20to%20search%20for', api_view)
        initial_time = time.time() - start
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertIsInstance(response.data['results'], list)
        self.assertGreater(len(response.data['results']), 0)
        self.assertIsInstance(response.data['results'][0], dict)
        self.assertEqual(response.data['results'][0]['id'], shared_deck.pk)

        # Test caching speed increase
        start = time.time()
        response = self.get_response(f'{api_path}?q=Deck%20to%20search%20for', api_view)
        new_time = time.time() - start
        if initial_time > 0.01:
            self.assertLess(new_time, initial_time, 'Caching did not speed up')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertIsInstance(response.data['results'], list)
        self.assertGreater(len(response.data['results']), 0)
        self.assertIsInstance(response.data['results'][0], dict)
        self.assertEqual(response.data['results'][0]['id'], shared_deck.pk)

        # Search for non-existant thing
        response = self.get_response(f'{api_path}?q=fjioerfjhpiejhqojdpqwoiedj', api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertIsInstance(response.data['results'], list)
        self.assertEqual(len(response.data['results']), 0)

    def test_txt_file_upload_api(self):
        api_path = '/api/decks/textupload/'
        api_view = api_views.txt_file_upload

        example_txt = """
            123\t456
            abc\tdef
        """.replace(' ', '')

        initial_flashcards = FlashCard.objects.count()
        initial_review_instances = ReviewInstance.objects.count()
        response = self.post_response(api_path, api_view, {
            'deck_title': 'Uploaded txt',
            'uploaded_file': example_txt,
        })
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        self.assertTrue(Deck.objects.filter(pk=response.data['id']).exists())
        try:
            Deck.objects.get(pk=response.data['id']).study_session_manager
        except Deck.study_session_manager.RelatedObjectDoesNotExist:
            self.fail('Deck study session manager not created during import')
        self.assertEqual(FlashCard.objects.count(), initial_flashcards + 2)
        self.assertEqual(ReviewInstance.objects.count(), initial_review_instances + 2)

        review_instance = ReviewInstance.objects.filter(
            flashcard__deck__pk=response.data['id']
        ).first()
        self.assertEqual(
            review_instance.flashcard.fields,
            [create_slate_element('123'), create_slate_element('456')],
        )
        review_instance = ReviewInstance.objects.filter(
            flashcard__deck__pk=response.data['id']
        ).last()
        self.assertEqual(
            review_instance.flashcard.fields,
            [create_slate_element('abc'), create_slate_element('def')],
        )

    def test_ssm_flashcards_api(self):
        deck = self.create_deck('Deck to study', num_flashcards=37)
        ssm = deck.study_session_manager  # type: DeckStudySessionManager
        api_path = f'/api/decks/ssm/{ssm.pk}/flashcards/'
        api_view = api_views.ssm_flashcards_view
        kwargs = {'ssm_id': ssm.pk}

        # Test as random user
        response = self.get_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 404)

        response = self.get_response(api_path, api_view, kwargs=kwargs, is_anon=True)
        self.assertEqual(response.status_code, 403)

        # Test default flashcards
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(len(response.data['flashcards']), ssm.daily_new_card_limit)
        self.assertEqual(response.data['num_overflow'], 0)
        self.assertEqual(
            [flashcard['id'] for flashcard in response.data['flashcards']],
            [str(f.pk) for f in ReviewInstance.objects.filter(
                flashcard__deck=deck
            ).all()[:ssm.daily_new_card_limit]]
        )

        # Shuffle unseen cards
        ssm.shuffle_unseen_cards = True
        ssm.save()
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(len(response.data['flashcards']), ssm.daily_new_card_limit)
        self.assertEqual(response.data['num_overflow'], 0)
        self.assertNotEqual(
            [flashcard['id'] for flashcard in response.data['flashcards']],
            [f.pk for f in ReviewInstance.objects.filter(
                flashcard__deck=deck
            ).all()[:ssm.daily_new_card_limit]]
        )
        ssm.shuffle_unseen_cards = False
        ssm.save()

        # Change daily new card limit
        ssm.daily_new_card_limit = 27
        ssm.save()
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(len(response.data['flashcards']), ssm.daily_new_card_limit)
        self.assertEqual(response.data['num_overflow'], 0)
        self.assertEqual(
            [flashcard['id'] for flashcard in response.data['flashcards']],
            [str(f.pk) for f in ReviewInstance.objects.filter(
                flashcard__deck=deck
            ).all()[:ssm.daily_new_card_limit]]
        )
        ssm.daily_new_card_limit = 20
        ssm.save()

        # Mark some unseen flashcards as having been done
        ssm.new_cards_done_today = 13
        ssm.save()
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit - ssm.new_cards_done_today,
        )
        self.assertEqual(response.data['num_overflow'], 0)
        self.assertEqual(
            [flashcard['id'] for flashcard in response.data['flashcards']],
            [str(f.pk) for f in ReviewInstance.objects.filter(
                flashcard__deck=deck
            ).all()[:ssm.daily_new_card_limit - ssm.new_cards_done_today]]
        )
        ssm.new_cards_done_today = 0
        ssm.save()

        # Mark some flashcards as needing to be reviewed
        num_reviews = 7
        flashcards = ReviewInstance.objects.filter(
            flashcard__deck=deck
        ).reverse().values('pk')[:num_reviews]
        flashcards = ReviewInstance.objects.filter(pk__in=flashcards)
        flashcards.update(
            next_review=dt.datetime.now(tz=dt.timezone.utc) - dt.timedelta(seconds=5),
            learning_status='LEARNING',
        )
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit + num_reviews,
        )
        self.assertEqual(response.data['num_overflow'], 0)
        all_flashcards = ReviewInstance.objects.filter(flashcard__deck=deck)
        self.assertEqual(
            len([f for f in all_flashcards if f.learning_status == 'UNSEEN']),
            all_flashcards.count() - num_reviews,
        )
        self.assertEqual(
            len([f for f in all_flashcards if f.learning_status == 'LEARNING']),
            num_reviews,
        )

        # Test daily seen card limit
        ssm.daily_seen_card_limit = 3
        ssm.save()

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit + ssm.daily_seen_card_limit,
        )
        self.assertEqual(
            len([f for f in response.data['flashcards'] if f['learning_status'] == 'UNSEEN']),
            ssm.daily_new_card_limit,
        )
        self.assertEqual(
            len([f for f in response.data['flashcards'] if f['learning_status'] == 'LEARNING']),
            ssm.daily_seen_card_limit,
        )
        self.assertEqual(response.data['num_overflow'], 0)

        ssm.seen_cards_done_today = 2
        ssm.save()

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit + ssm.daily_seen_card_limit - ssm.seen_cards_done_today,
        )
        self.assertEqual(
            len([f for f in response.data['flashcards'] if f['learning_status'] == 'UNSEEN']),
            ssm.daily_new_card_limit,
        )
        self.assertEqual(
            len([f for f in response.data['flashcards'] if f['learning_status'] == 'LEARNING']),
            ssm.daily_seen_card_limit - ssm.seen_cards_done_today,
        )
        self.assertEqual(response.data['num_overflow'], 0)

        # Test what happens when the user studies a certain number
        # of seen cards, then decreases the daily seen card limit
        # to a number lower than the amount of cards they studied
        ssm.seen_cards_done_today = 20
        ssm.daily_seen_card_limit = 15
        ssm.save()

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(len(response.data['flashcards']), ssm.daily_new_card_limit)
        self.assertEqual(response.data['num_overflow'], 0)

        # Test Overflow Bucket
        ssm.seen_cards_done_today = 0
        ssm.daily_seen_card_limit = 20
        ssm.save()

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_seen_card_limit + num_reviews,
        )  # cards from earlier
        self.assertEqual(response.data['num_overflow'], 0)

        flashcards.update(
            next_review=dt.datetime.now(tz=dt.timezone.utc) - dt.timedelta(days=5),
            learning_status='LEARNED',
        )  # update the flashcards to be well past reviewed

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit,
        )  # no longer in main reviews
        self.assertEqual(response.data['num_overflow'], num_reviews)

        response = self.get_response(
            f'{api_path}?from_overflow_bucket=true',
            api_view,
            kwargs=kwargs,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            num_reviews,
        )  # only shows flashcards from overflow bucket
        self.assertEqual(response.data['num_overflow'], None)

        flashcards.update(
            next_review=dt.datetime.now(tz=dt.timezone.utc) - dt.timedelta(seconds=5),
            learning_status='LEARNED',
        )  # update the flashcards to be recent again

        # Test CSSMs
        deck = self.create_deck('Deck to study', num_flashcards=37)
        ssm = CustomStudySessionManager.objects.create(
            title='CSSM to study',
            user=self.user.profile,
        )
        api_path = f'/api/decks/ssm/{ssm.pk}/flashcards/'
        kwargs = {'ssm_id': ssm.pk}

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(
            len(response.data['flashcards']),
            ssm.daily_new_card_limit + num_reviews,
        )
        self.assertEqual(response.data['num_overflow'], 0)

        # Test various CSSM filter options
        ssm = CustomStudySessionManager.objects.create(
            title='CSSM to study',
            user=self.user.profile,
            learning_status='LEARNED',
        )
        api_path = f'/api/decks/ssm/{ssm.pk}/flashcards/'
        kwargs = {'ssm_id': ssm.pk}

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['flashcards'], list)
        self.assertEqual(len(response.data['flashcards']), num_reviews)
        self.assertEqual(response.data['num_overflow'], 0)

    def test_ssm_detail_api(self):
        deck = self.create_deck('Deck to study')
        ssm = deck.study_session_manager  # type: DeckStudySessionManager
        api_path = f'/api/decks/ssm/{ssm.pk}/'
        api_view = api_views.ssm_detail_view
        kwargs = {'ssm_id': ssm.pk}

        # Attempt as random user
        response = self.get_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 404)

        response = self.get_response(api_path, api_view, kwargs=kwargs, is_anon=True)
        self.assertEqual(response.status_code, 403)

        # Get ssm
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['id'], ssm.pk)

    def test_ssm_flashcard_update_api(self):
        deck = self.create_deck('Deck to update flashcards', num_flashcards=3)
        ssm = deck.study_session_manager  # type: DeckStudySessionManager
        review_instance = ReviewInstance.objects.filter(flashcard__deck=deck).first()
        api_path = f'/api/decks/ssm/{ssm.pk}/flashcards/{review_instance.pk}/update/'
        api_view = api_views.ssm_flashcard_update_view
        kwargs = {'ssm_id': ssm.pk, 'flashcard_id': review_instance.pk}

        # Helper func
        def check_flashcard_update(
            flashcard: ReviewInstance,
            num_hist: int,
            target_new_done: int,
            target_seen_done: int,
            target_time_spent: int,
            increment_new_cards_done_today: bool,
        ):
            self.assertEqual(flashcard.next_review, get_morning())
            self.assertEqual(flashcard.learning_status, 'UNSEEN')
            self.assertEqual(flashcard.ease, 250)
            self.assertEqual(flashcard.interval, 0)
            self.assertEqual(
                ProfileHistorySegment.objects.filter(
                    profile=self.user.profile
                ).count(),
                num_hist,
            )

            new_date = dt.datetime.now(tz=dt.timezone.utc) + dt.timedelta(days=4)
            response = self.post_response(api_path, api_view, {
                'next_review': new_date,
                'learning_status': 'LEARNED',
                'ease': 265,
                'interval': 4,
                'increment_new_cards_done_today': increment_new_cards_done_today,
                'utc_timezone_offset': 300,
                'time_taken': 1000,
            }, kwargs=kwargs)
            self.assertEqual(response.status_code, 200)

            flashcard.refresh_from_db()
            self.assertEqual(flashcard.next_review, new_date)
            self.assertEqual(flashcard.learning_status, 'LEARNED')
            self.assertEqual(flashcard.ease, 265)
            self.assertEqual(flashcard.interval, 4)

            ssm.refresh_from_db()
            self.assertEqual(ssm.new_cards_done_today, target_new_done)
            self.assertEqual(ssm.seen_cards_done_today, target_seen_done)

            self.assertEqual(
                ProfileHistorySegment.objects.filter(
                    profile=self.user.profile
                ).count(),
                1,
            )
            history = ProfileHistorySegment.objects.filter(
                    profile=self.user.profile
            ).first()  # type: ProfileHistorySegment
            self.assertIsNotNone(history)
            self.assertEqual(history.cards_done, target_new_done + target_seen_done)
            self.assertEqual(history.time_spent, target_time_spent)

        # Attempt as random user
        response = self.post_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 400)

        response = self.post_response(api_path, api_view, kwargs=kwargs, is_anon=True)
        self.assertEqual(response.status_code, 403)

        # Update unseen flashcard
        check_flashcard_update(
            flashcard=review_instance,
            num_hist=0,
            target_new_done=1,
            target_seen_done=0,
            target_time_spent=1000,
            increment_new_cards_done_today=True,
        )

        # Update seen flashcard
        review_instance = ReviewInstance.objects.filter(flashcard__deck=deck).last()
        api_path = f'/api/decks/ssm/{ssm.pk}/flashcards/{review_instance.pk}/update/'
        api_view = api_views.ssm_flashcard_update_view
        kwargs = {'ssm_id': ssm.pk, 'flashcard_id': review_instance.pk}
        check_flashcard_update(
            flashcard=review_instance,
            num_hist=1,
            target_new_done=1,
            target_seen_done=1,
            target_time_spent=2000,
            increment_new_cards_done_today=False,
        )

    def test_ssm_edit_api(self):
        deck = self.create_deck('Deck to house ssm')
        ssm = deck.study_session_manager
        api_path = f'/api/decks/ssm/{ssm.pk}/edit/'
        api_view = api_views.ssm_edit_view
        kwargs = {'ssm_id': ssm.pk}

        # Helper functions
        def check_initial_ssm(ssm):
            self.assertEqual(ssm.scheduling_algorithm, 'ANKING')
            self.assertEqual(ssm.shuffle_unseen_cards, False)
            self.assertEqual(ssm.daily_new_card_limit, 20)
            self.assertEqual(ssm.daily_seen_card_limit, 200)
            self.assertEqual(ssm.review_ahead_minutes, 120)

        def check_changed_ssm(ssm):
            ssm.refresh_from_db()
            self.assertEqual(ssm.scheduling_algorithm, 'ANKI')
            self.assertEqual(ssm.shuffle_unseen_cards, True)
            self.assertEqual(ssm.daily_new_card_limit, 25)
            self.assertEqual(ssm.daily_seen_card_limit, 250)
            self.assertEqual(ssm.review_ahead_minutes, 150)

        # Test deck SSM
        check_initial_ssm(ssm)
        response = self.post_response(api_path, api_view, {
            'scheduling_algorithm': 'ANKI',
            'shuffle_unseen_cards': True,
            'daily_new_card_limit': 25,
            'daily_seen_card_limit': 250,
            'review_ahead_minutes': 150,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        check_changed_ssm(ssm)

        # Test with CSSM
        ssm = CustomStudySessionManager.objects.create(
            user=self.user.profile,
            title='CSSM to edit',
            deck_ids='1,2,3',
            tags='a AND NOT b',
            contains='word',
            leech=False,
            learning_status='UNSEEN',
            min_ease=150,
            max_ease=300,
        )  # type: CustomStudySessionManager
        api_path = f'/api/decks/ssm/{ssm.pk}/edit/'
        kwargs = {'ssm_id': ssm.pk}

        check_initial_ssm(ssm)
        self.assertEqual(ssm.title, 'CSSM to edit')
        self.assertEqual(ssm.deck_ids, '1,2,3')
        self.assertEqual(ssm.tags, 'a AND NOT b')
        self.assertEqual(ssm.contains, 'word')
        self.assertEqual(ssm.min_ease, 150)
        self.assertEqual(ssm.max_ease, 300)
        response = self.post_response(api_path, api_view, {
            'scheduling_algorithm': 'ANKI',
            'shuffle_unseen_cards': True,
            'daily_new_card_limit': 25,
            'daily_seen_card_limit': 250,
            'review_ahead_minutes': 150,
            'title': 'Edited CSSM',
            'deck_ids': [2, 3, 4],
            'tags': 'b AND NOT a',
            'contains': 'drow',
            'min_ease': 160,
            'max_ease': 290,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        check_changed_ssm(ssm)
        self.assertEqual(ssm.title, 'Edited CSSM')
        self.assertEqual(ssm.deck_ids, '2,3,4')
        self.assertEqual(ssm.tags, 'b AND NOT a')
        self.assertEqual(ssm.contains, 'drow')
        self.assertEqual(ssm.min_ease, 160)
        self.assertEqual(ssm.max_ease, 290)

    def test_ssm_create_api(self):
        api_path = '/api/decks/ssm/create/'
        api_view = api_views.ssm_create_view

        initial_cssms = CustomStudySessionManager.objects.filter(
            user=self.user.profile,
        ).count()
        response = self.post_response(api_path, api_view, {
            'title': 'New custom study',
            'deck_ids': [1, 2, 3],
            'tags': 'abc AND NOT def',
            'contains': 'wasd',
            'leech': False,
            'learning_status': 'RELEARNING',
            'min_ease': 140,
            'max_ease': 180,
        })
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(CustomStudySessionManager.objects.filter(
            user=self.user.profile,
        ).count(), initial_cssms + 1)
        cssm = CustomStudySessionManager.objects.get(
            pk=response.data['id'],
        )  # type: CustomStudySessionManager
        self.assertEqual(cssm.title, 'New custom study')
        self.assertEqual(cssm.deck_ids, '1,2,3')
        self.assertEqual(cssm.tags, 'abc AND NOT def')
        self.assertEqual(cssm.contains, 'wasd')
        self.assertEqual(cssm.leech, False)
        self.assertEqual(cssm.learning_status, 'RELEARNING')
        self.assertEqual(cssm.min_ease, 140)
        self.assertEqual(cssm.max_ease, 180)

    def test_ssm_delete_api(self):
        ssm = CustomStudySessionManager.objects.create(
            title='CSSM to delete',
            user=self.user.profile,
        )
        api_path = f'/api/decks/ssm/{ssm.pk}/delete/'
        api_view = api_views.ssm_delete_view
        kwargs = {'ssm_id': ssm.pk}

        initial_num_cssm = CustomStudySessionManager.objects.filter(user=self.user.profile).count()

        # Attempt to delete as non user
        response = self.post_response(api_path, api_view, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            CustomStudySessionManager.objects.filter(user=self.user.profile).count(),
            initial_num_cssm,
        )

        # Delete
        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            CustomStudySessionManager.objects.filter(user=self.user.profile).count(),
            initial_num_cssm - 1,
        )

        # Attempt to delete again
        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            CustomStudySessionManager.objects.filter(user=self.user.profile).count(),
            initial_num_cssm - 1,
        )

    def test_shared_deck_create_api(self):
        deck = self.create_deck('Deck to share')
        api_path = '/api/decks/shared/create/'
        api_view = api_views.shared_deck_create_view
        data = {
            'origin_deck_id': deck.pk,
            'title': 'Shared deck',
            'description': 'Description',
            'sharing_setting': 'PUBLIC',
        }

        num_shared_decks = SharedDeck.objects.count()

        # Attempt to share as non-owner
        response = self.post_response(api_path, api_view, data, user=self.users[1])
        self.assertEqual(response.status_code, 400)
        self.assertEqual(SharedDeck.objects.count(), num_shared_decks)

        response = self.post_response(api_path, api_view, data, is_anon=True)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SharedDeck.objects.count(), num_shared_decks)

        # Share deck with no flashcards
        response = self.post_response(api_path, api_view, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(SharedDeck.objects.count(), num_shared_decks + 1)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['creators'][0], deck.pk)
        shared_deck = SharedDeck.objects.filter(pk=response.data['id']).first()
        self.assertIsNotNone(shared_deck)
        self.assertEqual(shared_deck.title, 'Shared deck')
        self.assertEqual(shared_deck.description, 'Description')
        self.assertEqual(shared_deck.sharing_setting, 'PUBLIC')
        self.assertEqual(shared_deck.version_number, 0)
        self.assertEqual(shared_deck.deck_type, 'shared')
        deck = Deck.objects.get(pk=deck.pk)
        self.assertEqual(deck.shared_deck, shared_deck)

        # Test with flashcards
        deck = self.create_deck('Deck to share with flashcards', num_flashcards=53)
        num_shared_decks = SharedDeck.objects.count()
        num_review_instances = ReviewInstance.objects.count()
        num_creators = FlashCard.objects.count()
        response = self.post_response(api_path, api_view, {
            'origin_deck_id': deck.pk,
            'title': 'Shared deck with flashcards',
            'description': 'Description',
            'sharing_setting': 'FRIENDS',
        })
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['creators'][0], deck.pk)
        shared_deck = SharedDeck.objects.filter(pk=response.data['id']).first()
        self.assertIsNotNone(shared_deck)
        self.assertEqual(shared_deck.title, 'Shared deck with flashcards')
        self.assertEqual(shared_deck.description, 'Description')
        self.assertEqual(shared_deck.sharing_setting, 'FRIENDS')
        self.assertEqual(shared_deck.version_number, 0)
        self.assertEqual(shared_deck.deck_type, 'shared')
        deck = Deck.objects.get(pk=deck.pk)
        self.assertEqual(deck.shared_deck, shared_deck)

        self.assertEqual(SharedDeck.objects.count(), num_shared_decks + 1)
        self.assertEqual(FlashCard.objects.count(), num_creators + 53)
        # Review instances aren't created for share decks
        self.assertEqual(ReviewInstance.objects.count(), num_review_instances)

        shared_flashcards = shared_deck.flashcards.all().order_by('flashcard_num')
        origin_flashcards = deck.flashcards.all().order_by('flashcard_num')
        for flashcard, origin in zip(shared_flashcards, origin_flashcards):
            self.assertEqual(flashcard.flashcard_num, origin.flashcard_num)
            self.assertEqual(flashcard.flashcard_type, origin.flashcard_type)
            self.assertEqual(flashcard.fields, origin.fields)

            self.assertEqual(flashcard.deck.pk, shared_deck.pk)
            self.assertEqual(flashcard.origin_creator.pk, origin.pk)
            self.assertIsNone(flashcard.copied_from_creator)
            self.assertEqual(origin.deck.pk, deck.pk)

    def test_clone_flashcard(self):
        deck = self.create_deck('Deck with a flashcard', num_flashcards=2)
        deck_to_clone_into = self.create_deck('Deck to clone into')

        def test_flashcard_amounts(
            num_flashcards=None,
            num_review_instances=None,
            deck=deck,
        ):
            deck.refresh_from_db()
            if num_flashcards is not None:
                self.assertEqual(deck.flashcards.count(), num_flashcards)

            if num_review_instances is not None:
                self.assertEqual(
                    ReviewInstance.objects.filter(flashcard__deck=deck).count(),
                    num_review_instances,
                )

        test_flashcard_amounts(2, 2)
        test_flashcard_amounts(0, 0, deck_to_clone_into)

        flashcard = deck.flashcards.first()  # type: FlashCard
        cloned_flashcard, cloned_review_instances = flashcard.clone(
            deck_to_clone_into,
            origin_or_copied='COPIED',
            skip_creating_review_instances=False,
        )
        cloned_flashcard.save()
        ReviewInstance.objects.bulk_create(cloned_review_instances)

        test_flashcard_amounts(2, 2)
        test_flashcard_amounts(1, 1, deck_to_clone_into)

        cloned_flashcard = deck_to_clone_into.flashcards.first()
        attrs = ['tags', 'fields', 'flashcard_num', 'flashcard_type']
        self.assertEqualAttrs(cloned_flashcard, flashcard, attrs)
        self.assertEqual(cloned_flashcard.deck.pk, deck_to_clone_into.pk)

    def test_shared_deck_clone_api(self):
        api_view = api_views.shared_deck_clone_view

        # Test without flashcards
        deck = self.create_deck('Deck to share then clone')
        shared_deck = deck.create_shared_deck('Shared deck to clone', '')
        api_path = f'/api/decks/shared/clone/{shared_deck.pk}/'
        kwargs = {'shared_deck_id': shared_deck.pk}

        num_decks = Deck.objects.filter(user=self.user).count()
        self.assertEqual(deck.shared_deck.pk, shared_deck.pk)
        response = self.post_response(api_path, api_view, {
            'destination_deck_title': 'Cloned deck',
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Deck.objects.filter(user=self.user).count(), num_decks + 1)
        self.assertIsInstance(response.data, dict)
        cloned_deck = Deck.objects.filter(pk=response.data['id']).first()  # type: Deck
        self.assertIsNotNone(cloned_deck)
        self.assertEqual(cloned_deck.shared_deck_relations.count(), 1)

        # Test with flashcards
        deck = self.create_deck('Deck with flashcards to share then clone', num_flashcards=43)
        shared_deck = deck.create_shared_deck('Shared deck with flashcards to clone', '')
        api_path = f'/api/decks/shared/clone/{shared_deck.pk}/'
        kwargs = {'shared_deck_id': shared_deck.pk}

        num_review_instances = ReviewInstance.objects.count()
        num_flashcards = FlashCard.objects.count()

        num_decks = Deck.objects.filter(user=self.user).count()
        self.assertEqual(deck.shared_deck.pk, shared_deck.pk)
        response = self.post_response(api_path, api_view, {
            'destination_deck_title': 'Cloned deck with flashcards',
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Deck.objects.filter(user=self.user).count(), num_decks + 1)
        self.assertIsInstance(response.data, dict)
        cloned_deck = Deck.objects.filter(pk=response.data['id']).first()  # type: Deck
        self.assertIsNotNone(cloned_deck)
        self.assertEqual(cloned_deck.shared_deck_relations.count(), 1)

        self.assertEqual(Deck.objects.filter(user=self.user).count(), num_decks + 1)
        self.assertEqual(ReviewInstance.objects.count(), num_review_instances + 43)
        self.assertEqual(FlashCard.objects.count(), num_flashcards + 43)

        shared_flashcards = shared_deck.flashcards.all().order_by('flashcard_num')
        cloned_flashcards = cloned_deck.flashcards.all().order_by('flashcard_num')
        for cloned_flashcard, shared_flashcard in zip(cloned_flashcards, shared_flashcards):
            self.assertEqual(cloned_flashcard.fields, shared_flashcard.fields)
            self.assertEqual(cloned_flashcard.tags, shared_flashcard.tags)
            self.assertEqual(cloned_flashcard.flashcard_num, shared_flashcard.flashcard_num)
            self.assertEqual(cloned_flashcard.flashcard_type, shared_flashcard.flashcard_type)

            self.assertEqual(cloned_flashcard.deck.pk, cloned_deck.pk)
            self.assertEqual(shared_flashcard.deck.pk, shared_deck.pk)
            self.assertEqual(cloned_flashcard.copied_from_creator.pk, shared_flashcard.pk)
            self.assertIsNone(cloned_flashcard.origin_creator)

            cloned_review_instances = ReviewInstance.objects.filter(flashcard=cloned_flashcard)
            for review_instance in cloned_review_instances:
                self.assertEqual(review_instance.content_indicies, [0, 1])
                self.assertEqual(review_instance.name, None)
                self.assertEqual(review_instance.learning_status, 'UNSEEN')
                self.assertEqual(review_instance.steps_index, 0)
                self.assertEqual(review_instance.ease, 250)
                self.assertEqual(review_instance.interval, 0)
                self.assertEqual(review_instance.is_suspended, False)
                self.assertEqual(review_instance.leech_index, 0)

        # Make sure you can't clone the same deck twice
        num_decks = Deck.objects.filter(user=self.user).count()
        response = self.post_response(api_path, api_view, {
            'destination_deck_title': 'Cloned deck with flashcards',
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Deck.objects.filter(user=self.user).count(), num_decks)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['message'], 'You have already cloned this deck')

    def test_shared_deck_edit_api(self):
        deck = self.create_deck('Deck to share and edit')
        shared_deck = deck.create_shared_deck('Shared deck to edit', 'desc')
        api_path = f'/api/decks/shared/edit/{shared_deck.pk}/'
        api_view = api_views.shared_deck_edit_view
        kwargs = {'shared_deck_id': shared_deck.pk}

        self.assertEqual(shared_deck.title, 'Shared deck to edit')
        self.assertEqual(shared_deck.description, 'desc')
        self.assertEqual(shared_deck.sharing_setting, 'PUBLIC')

        response = self.post_response(api_path, api_view, {
            'new_title': 'Edited shared deck',
            'new_description': 'new desc',
            'new_sharing_setting': 'FRIENDS',
        }, kwargs=kwargs)
        shared_deck = SharedDeck.objects.get(pk=shared_deck.pk)  # SharedDeck
        self.assertEqual(response.status_code, 200)
        self.assertEqual(shared_deck.title, 'Edited shared deck')
        self.assertEqual(shared_deck.description, 'new desc')
        self.assertEqual(shared_deck.sharing_setting, 'FRIENDS')

    def _shared_deck_test_wrapper(
        self,
        modifying_function: Callable[[Deck], None],
        expected_diff: dict,
    ):
        deck = self.create_deck('Deck', num_flashcards=3)
        shared_deck = deck.create_shared_deck('Shared')
        self.assertDecksEqual(deck, shared_deck, test_review_instances_exists=False)

        # Modify deck
        modifying_function(deck)
        self.assertDecksNotEqual(deck, shared_deck, test_review_instances_exists=False)

        # Check diff
        response = self.post_response('', api_views.shared_deck_update_view, {
            'shared_deck_id': shared_deck.pk,
            'origin_deck_id': deck.pk,
            'check_diff_only': True,
        })
        shared_deck.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_diff)
        self.assertEqual(shared_deck.version_number, 0)
        self.assertDecksNotEqual(deck, shared_deck, test_review_instances_exists=False)

        # Update shared deck
        response = self.post_response('', api_views.shared_deck_update_view, {
            'shared_deck_id': shared_deck.pk,
            'origin_deck_id': deck.pk,
        })
        shared_deck.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertDecksEqual(deck, shared_deck, test_review_instances_exists=False)
        self.assertEqual(shared_deck.version_number, 1)

    def test_shared_deck_update_api_add_cards(self):
        def add_cards(deck: Deck):
            FlashCard.create_flashcard(
                deck,
                '',
                'cloze',
                [create_slate_element('{{c1::abc}} {{c2::def}} {{c3::ghi}}')],
            )[0]  # type: FlashCard

        self._shared_deck_test_wrapper(add_cards, {'created': 1, 'modified': 0, 'deleted': 0})

    def test_shared_deck_update_api_edit_cards(self):
        def edit_cards(deck: Deck):
            flashcard = deck.flashcards.last()
            flashcard.fields = [create_slate_element('oifj'), create_slate_element('dwidh')]
            flashcard.save()

        self._shared_deck_test_wrapper(edit_cards, {'created': 0, 'modified': 1, 'deleted': 0})

    def test_shared_deck_update_api_delete_cards(self):
        def delete_cards(deck: Deck):
            deck.flashcards.last().delete()

        self._shared_deck_test_wrapper(delete_cards, {'created': 0, 'modified': 0, 'deleted': 1})

    def test_deck_get_updates_api(self):
        deck = self.create_deck('Deck to share and update and get updates from')
        shared_deck = deck.create_shared_deck('Shared deck to update and get updates from', '')
        cloned_deck = shared_deck.clone(self.user, 'Cloned shared deck to get updates')
        api_path = f'/api/decks/get-updates/{cloned_deck.pk}/'
        api_view = api_views.deck_get_updates_view
        kwargs = {'deck_id': cloned_deck.pk}

        # Test with no updates
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['needs_updating'], list)
        self.assertEqual(len(response.data['needs_updating']), 0)

        # Test with only getting diff
        shared_deck.push_updates(deck, True)
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['needs_updating'], list)
        self.assertEqual(len(response.data['needs_updating']), 0)

        # Update and test
        shared_deck.push_updates(deck)

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['needs_updating'], list)
        self.assertEqual(len(response.data['needs_updating']), 1)
        self.assertEqual(
            response.data['needs_updating'][0]['title'],
            'Shared deck to update and get updates from',
        )
        self.assertEqual(
            response.data['needs_updating'][0]['id'],
            shared_deck.pk,
        )

    def test_deck_pull_updates_api(self):
        deck = self.create_deck('Deck to share and update', num_flashcards=13)
        shared_deck = deck.create_shared_deck('Shared deck to update', '')
        cloned_deck = shared_deck.clone(self.user, 'Cloned deck to pull updates')

        api_path = f'/api/decks/get-updates/{deck.pk}/'
        api_view = api_views.deck_pull_updates_view
        kwargs = {'deck_id': cloned_deck.pk}

        # Set some flashcards to having been reviewed
        ReviewInstance.objects.filter(
            flashcard__deck=cloned_deck,
            flashcard__flashcard_num__lte=5,
        ).update(learning_status='LEARNING')

        # Helper functions
        def check_equal(cloned_deck, shared_deck, response):
            shared_deck = SharedDeck.objects.get(pk=shared_deck.pk)  # type: SharedDeck
            cloned_deck = Deck.objects.get(pk=cloned_deck.pk)  # type: Deck
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.data, dict)
            self.assertEqual(response.data['id'], cloned_deck.pk)
            cloned_flashcards = FlashCard.objects.filter(deck=cloned_deck)
            shared_flashcards = FlashCard.objects.filter(deck=shared_deck)
            self.assertEqual(
                cloned_flashcards.count(),
                shared_flashcards.count(),
            )

            for cloned_flashcard, shared_flashcard in zip(cloned_flashcards, shared_flashcards):
                attrs = ['fields', 'tags', 'flashcard_num', 'flashcard_type']
                self.assertEqualAttrs(shared_flashcard, cloned_flashcard, attrs)
                self.assertEqual(cloned_flashcard.copied_from_creator, shared_flashcard)

        # Test adding flashcards
        num_shared_flashcards = FlashCard.objects.filter(deck=shared_deck).count()
        FlashCard.create_flashcard(
            deck,
            'tags',
            'basic',
            [create_slate_element('front'), create_slate_element('back')],
        )[0].flashcard
        shared_deck.push_updates(deck)
        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            num_shared_flashcards + 1,
        )

        num_cloned_flashcards = FlashCard.objects.filter(deck=cloned_deck).count()
        num_cloned_ris = ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count()
        num_learning = ReviewInstance.objects.filter(
            flashcard__deck=cloned_deck,
            learning_status='LEARNING',
        ).count()
        response = self.post_response(api_path, api_view, {
            'to_pull_from': shared_deck.pk,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            FlashCard.objects.filter(deck=cloned_deck).count(),
            num_cloned_flashcards + 1,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count(),
            num_cloned_ris + 1,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(
                flashcard__deck=cloned_deck,
                learning_status='LEARNING',
            ).count(),
            num_learning,
        )

        check_equal(cloned_deck, shared_deck, response)

        # Test adding cloze flashcard
        num_shared_flashcards = FlashCard.objects.filter(deck=shared_deck).count()
        FlashCard.create_flashcard(
            deck,
            'tags',
            'cloze',
            [create_slate_element('{{c1::123}} {{c2::456}} {{c3::789}} {{c4::abc}}')],
        )
        shared_deck.push_updates(deck)
        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            num_shared_flashcards + 1,
        )

        num_cloned_flashcards = FlashCard.objects.filter(deck=cloned_deck).count()
        num_cloned_ris = ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count()
        num_learning = ReviewInstance.objects.filter(
            flashcard__deck=cloned_deck,
            learning_status='LEARNING',
        ).count()
        response = self.post_response(api_path, api_view, {
            'to_pull_from': shared_deck.pk,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            FlashCard.objects.filter(deck=cloned_deck).count(),
            num_cloned_flashcards + 1,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count(),
            num_cloned_ris + 4,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(
                flashcard__deck=cloned_deck,
                learning_status='LEARNING',
            ).count(),
            num_learning,
        )

        check_equal(cloned_deck, shared_deck, response)

        # Test modifying flashcard
        flashcards = FlashCard.objects.filter(deck=shared_deck)
        num_shared_flashcards = flashcards.count()

        flashcard = flashcards.order_by('-flashcard_num')[1]
        flashcard.fields = [
            create_slate_element('edited front'),
            create_slate_element('edited back'),
        ]

        shared_deck.push_updates(deck)
        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            num_shared_flashcards,
        )

        num_cloned_flashcards = FlashCard.objects.filter(deck=cloned_deck).count()
        num_cloned_ris = ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count()
        num_learning = ReviewInstance.objects.filter(
            flashcard__deck=cloned_deck,
            learning_status='LEARNING',
        ).count()
        response = self.post_response(api_path, api_view, {
            'to_pull_from': shared_deck.pk,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            FlashCard.objects.filter(deck=cloned_deck).count(),
            num_cloned_flashcards,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count(),
            num_cloned_ris,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(
                flashcard__deck=cloned_deck,
                learning_status='LEARNING',
            ).count(),
            num_learning,
        )

        check_equal(cloned_deck, shared_deck, response)

        # Test modifying cloze flashcard
        num_shared_flashcards = FlashCard.objects.filter(deck=shared_deck).count()

        flashcard = FlashCard.objects.filter(deck=deck).last()  # type:  FlashCard
        flashcard.fields = [
            '{{c1::123}} {{c2::456}} {{c3::789}} {{c4::abc}} {{c5::abc}}'
        ]

        shared_deck.push_updates(deck)
        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            num_shared_flashcards,
        )

        # FIXME: fix cloze flashcard pulling (not creating new reviews)
        # num_cloned_creators = FlashCardCreator.objects.filter(deck=cloned_deck).count()
        # num_cloned_reviews = FlashCard.objects.filter(flashcard__deck=cloned_deck).count()
        # response = self.post_response(api_path, api_view, {
        #     'to_pull_from': shared_deck.pk,
        # }, kwargs=kwargs)
        # self.assertEqual(response.status_code, 200)
        # self.assertEqual(
        #     FlashCardCreator.objects.filter(deck=cloned_deck).count(),
        #     num_cloned_creators,
        # )
        # self.assertEqual(
        #     FlashCard.objects.filter(flashcard__deck=cloned_deck).count(),
        #     num_cloned_reviews + 2,
        # )

        # check_equal(cloned_deck, shared_deck, response)

        # Test deleting flashcard
        num_shared_flashcards = FlashCard.objects.filter(deck=shared_deck).count()

        flashcard = FlashCard.objects.filter(deck=deck).last()
        flashcard.delete()

        shared_deck.push_updates(deck)
        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            num_shared_flashcards - 1,
        )

        num_cloned_flashcards = FlashCard.objects.filter(deck=cloned_deck).count()
        num_cloned_ris = ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count()
        response = self.post_response(api_path, api_view, {
            'to_pull_from': shared_deck.pk,
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            FlashCard.objects.filter(deck=cloned_deck).count(),
            FlashCard.objects.filter(deck=deck).count(),
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count(),
            ReviewInstance.objects.filter(flashcard__deck=deck).count(),
        )
        check_equal(cloned_deck, shared_deck, response)

        # Test rearranging flashcard
        flashcard = deck.flashcards.all()[3]
        flashcard.rearrange('UP')
        shared_deck.push_updates(deck)
        response = self.post_response(api_path, api_view, {
            'to_pull_from': shared_deck.pk,
        }, kwargs=kwargs)
        check_equal(cloned_deck, shared_deck, response)

    def test_game_flashcards_api(self):
        api_view = api_views.game_flashcards_view
        api_path = '/api/decks/games/flashcards/'
        deck = self.create_deck('Deck to play games with', num_flashcards=20, str_tags=True)

        # Helper functions
        def test_game(flashcard_type, expected_amount, options={}, deck_id=None):
            response = self.post_response(api_path, api_view, {
                'deck_id': deck_id or deck.pk,
                'type': flashcard_type,
                'amount': 20,
                'options': options,
            })
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.data, list)
            self.assertEqual(len(response.data), expected_amount)

        # Test seen
        test_game('SEEN', 0)
        flashcards = ReviewInstance.objects.filter(
            flashcard__deck=deck,
            flashcard__flashcard_num__lte=4,
        )
        flashcards.update(learning_status='LEARNING')
        test_game('SEEN', 5)
        test_game('UNSEEN', 15)
        test_game('TAG', 1, {'tag': 'b AND NOT d'})
        test_game('ALL', 20)
        test_game('PERSONAL', 5)

        # Test CSSM
        cssm = CustomStudySessionManager.objects.create(
            user=self.user.profile,
            title='CSSM for games',
            tags='b AND NOT d',
            deck_ids=f'{deck.pk}',
        )
        test_game('SEEN', 1, deck_id=cssm.pk)

    def test_rearrange_flashcard_api(self):
        api_view = api_views.rearrange_flashcard_view
        deck = self.create_deck('Deck with flashcards to rearrange', num_flashcards=5)
        flashcard = deck.flashcards.all()[2]

        # Helper func
        def move_flashcard(direction, expected_flashcard_num, flashcard_pk, should_fail=False):
            flashcard = FlashCard.objects.get(pk=flashcard_pk)
            kwargs = {'deck_id': deck.pk, 'flashcard_num': flashcard.flashcard_num}
            api_path = f'/api/decks/{deck.pk}/flashcards/{flashcard.pk}/rearrange/'

            response = self.post_response(api_path, api_view, {
                'rearrange_type': direction,
            }, kwargs=kwargs)
            self.assertEqual(response.status_code, 400 if should_fail else 200)
            self.assertIsInstance(response.data, dict)

            flashcard = FlashCard.objects.get(pk=flashcard_pk)
            self.assertEqual(flashcard.flashcard_num, expected_flashcard_num)
            if not should_fail:
                self.assertEqual(response.data['id'], str(flashcard.pk))
                self.assertEqual(response.data['flashcard_num'], expected_flashcard_num)

        # Move to the top
        flashcard_num = flashcard.flashcard_num
        move_flashcard('DOWN', flashcard_num + 1, flashcard.pk)
        move_flashcard('DOWN', flashcard_num + 2, flashcard.pk)
        move_flashcard('DOWN', flashcard_num + 2, flashcard.pk, should_fail=True)

        # Then bring down to the bottom
        move_flashcard('UP', flashcard_num + 1, flashcard.pk)
        move_flashcard('UP', flashcard_num, flashcard.pk)
        move_flashcard('UP', flashcard_num - 1, flashcard.pk)
        move_flashcard('UP', flashcard_num - 2, flashcard.pk)
        move_flashcard('UP', flashcard_num - 2, flashcard.pk, should_fail=True)

    def test_edit_tags_bulk_api(self):
        api_view = api_views.edit_tags_bulk_view
        api_path = '/api/decks/edit-tags/'
        deck = self.create_deck('Deck to bulk edit tags', num_flashcards=5, str_tags=True)
        flashcards = deck.flashcards.all()
        flashcard_pks = [flashcard.pk for flashcard in flashcards]
        for flashcard in flashcards:
            self.assertFalse(flashcard.has_tag('wasd'))

        # Test add tag
        response = self.post_response(api_path, api_view, {
            'flashcard_ids': flashcard_pks,
            'action': 'ADD',
            'tag': 'wasd',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        flashcards = FlashCard.objects.filter(pk__in=flashcard_pks)
        for flashcard in flashcards:
            self.assertTrue(flashcard.has_tag('wasd'))

        # Test rename tag
        response = self.post_response(api_path, api_view, {
            'flashcard_ids': flashcard_pks,
            'action': 'RENAME',
            'tag': 'wasd',
            'rename_to': 'dsaw',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        flashcards = FlashCard.objects.filter(pk__in=flashcard_pks)
        for flashcard in flashcards:
            self.assertFalse(flashcard.has_tag('wasd'))
            self.assertTrue(flashcard.has_tag('dsaw'))

        # Test remove tag
        response = self.post_response(api_path, api_view, {
            'flashcard_ids': flashcard_pks,
            'action': 'REMOVE',
            'tag': 'dsaw',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        flashcards = FlashCard.objects.filter(pk__in=flashcard_pks)
        for flashcard in flashcards:
            self.assertFalse(flashcard.has_tag('dsaw'))

    def test_review_instance_bulk_update_api(self):
        api_view = api_views.flashcard_review_instance_bulk_update_view
        api_path = '/api/decks/edit-review-instances/'
        deck = self.create_deck('Deck to bulk edit tags', num_flashcards=5)
        review_instances = ReviewInstance.objects.filter(flashcard__deck=deck)
        review_instances_pks = [ri.pk for ri in review_instances]
        self.assertEqual(
            ReviewInstance.objects.filter(is_suspended=False, flashcard__deck=deck).count(),
            ReviewInstance.objects.filter(flashcard__deck=deck).count(),
        )

        # Helper func
        def bulk_update(action):
            response = self.post_response(api_path, api_view, {
                'flashcard_ids': review_instances_pks,
                'action': action,
            })
            self.assertEqual(response.status_code, 200)

        # Suspend
        bulk_update('SUSPEND')
        self.assertEqual(
            ReviewInstance.objects.filter(is_suspended=True, flashcard__deck=deck).count(),
            ReviewInstance.objects.filter(flashcard__deck=deck).count(),
        )

        # Unsuspend
        bulk_update('UNSUSPEND')
        self.assertEqual(
            ReviewInstance.objects.filter(is_suspended=False, flashcard__deck=deck).count(),
            ReviewInstance.objects.filter(flashcard__deck=deck).count(),
        )

        # Delete
        bulk_update('DELETE')
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=deck).count(),
            0,
        )

    def test_deck_statistics_api(self):
        deck = self.create_deck('Deck to get statistics from', num_flashcards=100)
        api_view = api_views.deck_statistics_view
        api_path = f'/api/decks/{deck.pk}/statistics/'
        kwargs = {'deck_id': deck.pk}

        # Test base statistics
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data, {
            'num_unseen': 100,
            'num_learning': 0,
            'num_learned': 0,
            'num_relearning': 0,
            'num_suspended': 0,
            'avg_ease': None,
        })

        # Test with changes
        flashcards = ReviewInstance.objects.filter(flashcard__deck=deck)

        def get_flashcard_slice(start=None, stop=None) -> QuerySet[ReviewInstance]:
            # NOTE: this function is required since you can't update a sliced queryset
            return ReviewInstance.objects.filter(pk__in=[f.pk for f in flashcards[start:stop]])

        get_flashcard_slice(0, 30).update(learning_status='UNSEEN')
        get_flashcard_slice(30, 45).update(learning_status='LEARNING')
        get_flashcard_slice(45, 65).update(learning_status='LEARNED')
        get_flashcard_slice(65, 75).update(learning_status='RELEARNING')
        get_flashcard_slice(75, 100).update(is_suspended=True)
        get_flashcard_slice().update(ease=260)

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data, {
            'num_unseen': 30,
            'num_learning': 15,
            'num_learned': 20,
            'num_relearning': 10,
            'num_suspended': 25,
            'avg_ease': 260,
        })

    def test_deck_quick_list_api(self):
        api_path = '/api/decks/quick/'
        api_view = api_views.deck_quick_list_view

        # Get list
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        # Add decks
        deck1 = self.create_deck('Quick Deck #1', num_flashcards=10)
        deck2 = self.create_deck('Quick Deck #2', num_flashcards=10)

        def test_percent(target_percent):
            response = self.get_response(api_path, api_view)

            def func():
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(response.data), 2)
                self.assertEqual(response.data[0]['title'], deck1.title)
                self.assertEqual(response.data[1]['title'], deck2.title)
                self.assertEqual(response.data[0]['id'], deck1.pk)
                self.assertEqual(response.data[1]['id'], deck2.pk)

            func()
            self.assertEqual(response.data[0]['percent_complete'], None)
            self.assertEqual(response.data[1]['percent_complete'], None)

            response = self.get_response(f'{api_path}?calc_percent_complete=true', api_view)
            func()
            self.assertEqual(response.data[0]['percent_complete'], target_percent)
            self.assertEqual(response.data[1]['percent_complete'], target_percent)

        test_percent(0.0)

        # Study decks and check percent complete
        flashcard_ids1 = [f.pk for f in ReviewInstance.objects.filter(flashcard__deck=deck1)]
        flashcard_ids2 = [f.pk for f in ReviewInstance.objects.filter(flashcard__deck=deck2)]

        for i in range(len(flashcard_ids1)):
            # Check percent complete
            test_percent(i/10)

            # Study decks
            flashcard1 = ReviewInstance.objects.get(pk=flashcard_ids1[i])
            flashcard1.learning_status = 'LEARNED'
            flashcard2 = ReviewInstance.objects.get(pk=flashcard_ids2[i])
            flashcard2.learning_status = 'LEARNED'

            flashcard1.save()
            flashcard2.save()

        # Final check for percent complete
        test_percent(1.0)

        # Test include_has_shared_deck
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        deck1.create_shared_deck('Shared Deck #1', '')
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        response = self.get_response(f'{api_path}?include_has_shared_deck=true', api_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_deck_json_export_api(self):
        deck = self.create_deck('Deck to export to JSON', num_flashcards=20)
        export_api_path = f'/api/decks/{deck.pk}/export/json/'
        export_api_view = api_views.deck_json_export_view
        import_api_path = '/api/decks/upload/json/'
        import_api_view = api_views.deck_json_import_view
        kwargs = {'deck_id': deck.pk}

        # Test as unauthorized user
        response = self.get_response(
            export_api_path,
            export_api_view,
            user=self.users[1],
            kwargs=kwargs,
        )
        self.assertEqual(response.status_code, 404)
        self.assertIsInstance(response.data['message'], str)

        response = self.get_response(export_api_path, export_api_view, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)

        # Export deck to JSON
        response = self.get_response(export_api_path, export_api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        json_deck = response.data

        def evaluate_json_deck(json_deck, review_instances=True):
            self.assertIsInstance(json_deck, dict)
            self.assertEqual(json_deck['title'], deck.title)
            self.assertEqual(len(json_deck['flashcards']), deck.flashcards.count())

            real_flashcards = deck.flashcards.all().order_by('flashcard_num')
            for json_flashcard, real_flashcard in zip(json_deck['flashcards'], real_flashcards):
                self.assertEqual(json_flashcard['tags'], real_flashcard.tags)
                self.assertEqual(json_flashcard['flashcard_type'], real_flashcard.flashcard_type)
                self.assertEqual(json_flashcard['flashcard_num'], real_flashcard.flashcard_num)
                self.assertEqual(len(json_flashcard['fields']), len(real_flashcard.fields))

                real_fields = real_flashcard.fields
                for json_field, real_field in zip(json_flashcard['fields'], real_fields):
                    self.assertEqual(json_field, real_field)

                if not review_instances:
                    self.assertIsNone(json_flashcard['review_instances'])
                    return

                self.assertEqual(
                    len(json_flashcard['review_instances']),
                    real_flashcard.review_instances.count(),
                )
                real_review_instances = real_flashcard.review_instances.all()
                attrs = [
                    'content_indicies', 'name', 'learning_status',
                    'steps_index', 'ease', 'next_review',
                    'interval', 'is_suspended', 'leech_index',
                ]
                for json_review_instance, real_review_instance in zip(
                    json_flashcard['review_instances'],
                    real_review_instances,
                ):
                    for attr in attrs:
                        self.assertEqual(
                            json_review_instance[attr],
                            getattr(real_review_instance, attr),
                        )

        evaluate_json_deck(json_deck)

        # Import JSON deck back to real deck
        self.assertEqual(Deck.objects.count(), 1)
        response = self.post_response(import_api_path, import_api_view, json_deck)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Deck.objects.count(), 2)
        imported_deck = Deck.objects.get(pk=response.data['id'])
        self.assertDecksEqual(imported_deck, deck)

        # Export deck to JSON without review instances
        response = self.get_response(
            f'{export_api_path}?export_review_instances=false',
            export_api_view,
            kwargs=kwargs,
        )
        self.assertEqual(response.status_code, 200)
        json_deck = response.data
        evaluate_json_deck(json_deck, review_instances=False)

        # Import JSON deck back to real deck
        self.assertEqual(Deck.objects.count(), 2)
        response = self.post_response(import_api_path, import_api_view, json_deck)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Deck.objects.count(), 3)
        imported_deck = Deck.objects.get(pk=response.data['id'])
        self.assertDecksEqual(imported_deck, deck, test_review_instances_equal=False)

    def test_deck_generate_skill_tree(self):
        target_skill_tree = {
            'a': {
                'b': {},
            },
        }
        deck = self.create_deck('Deck to generate skill tree from', num_flashcards=2)
        fc1, fc2 = deck.flashcards.first(), deck.flashcards.last()
        fc1.tags = 'a'
        fc2.tags = 'a, b'
        fc1.save()
        fc2.save()
        self.assertEqual(deck.generate_skill_tree(), target_skill_tree)

        # More complicated test
        target_skill_tree = {
            'a': {
                'a.b': {},
                'a.c': {
                    'a.c.d': {},
                    'a.c.e': {},
                },
                'a.f': {},
            },
            'g': {
                'g.h': {
                    'g.h.i': {}
                },
                'g.j': {},
                'g.k': {},
                'g.l': {
                    'g.l.m': {},
                    'g.l.n': {},
                },
            },
        }
        deck = self.create_deck('Deck to generate skill tree from', num_flashcards=12)
        flashcards = list(deck.flashcards.all())
        flashcards[0].tags = 'a'
        flashcards[1].tags = 'a, a.b'
        flashcards[2].tags = 'a, a.b'
        flashcards[3].tags = 'a, a.c, a.c.d'
        flashcards[4].tags = 'a, a.c, a.c.e'
        flashcards[5].tags = 'a, a.f'
        flashcards[6].tags = 'g, g.h, g.h.i, g.h.i.<none>'
        flashcards[7].tags = 'g, g.j'
        flashcards[8].tags = 'g, g.k'
        flashcards[9].tags = 'g, g.l, g.l.m'
        flashcards[10].tags = 'g, g.l, g.l.m, g.l.m.<none>'
        flashcards[11].tags = 'g, g.l, g.l.n'
        FlashCard.objects.bulk_update(flashcards, ['tags'])

        self.assertEqual(deck.generate_skill_tree(), target_skill_tree)


class DeckBrowserTestCase(SeleniumTestCase):
    def test_decks(self):
        self.common_login()

        # Navigate to decks homepage
        self.driver.find_element_by_id('decks-link').click()
        self.assertTextExists("You don't have any decks yet.")

        # Create new deck
        self.assertEqual(Deck.objects.count(), 0)
        deck_create_modal_xpath = '//*[@id="decks-home"]/div/div[1]/div/button'

        self.driver.find_element_by_xpath(deck_create_modal_xpath).click()
        self.fill_text_element('title', 'Deck created from selenium')
        self.click_option('NORM')
        self.fill_text_element('dailyNewCardLimit', 25)
        self.fill_text_element('dailySeenCardLimit', 250)
        self.click_button(html_id='toggle-advanced-options')
        self.click_button(html_name='shuffleUnseenCards')
        self.fill_text_element('reviewAheadMinutes', 180)
        self.click_option('ANKI')
        self.driver.find_element_by_id('edit-create-deck').click()
        self.sleep(1)

        # Assert deck created
        self.assertEqual(Deck.objects.count(), 1)
        self.assertTextExists('Deck created from selenium')
        deck = Deck.objects.first()
        ssm = deck.study_session_manager  # type: DeckStudySessionManager
        self.assertEqual(deck.title, 'Deck created from selenium')
        self.assertEqual(ssm.difficulty, 'NORM')
        self.assertEqual(ssm.daily_new_card_limit, 25)
        self.assertEqual(ssm.daily_seen_card_limit, 250)
        self.assertEqual(ssm.shuffle_unseen_cards, True)
        self.assertEqual(ssm.review_ahead_minutes, 180)
        self.assertEqual(ssm.scheduling_algorithm, 'ANKI')

        # Semi-reset the SSM so it doesn't actually mess anything up
        ssm.difficulty = 'HARD'
        ssm.daily_seen_card_limit = 20
        ssm.daily_seen_card_limit = 200
        ssm.shuffle_unseen_cards = False
        ssm.review_ahead_minutes = 120
        ssm.scheduling_algorithm = 'ANKING'
        ssm.save()

        # Study the new deck
        self.driver.find_element_by_class_name('study-btn').click()
        self.assertTextExists('Congratulations! You\'ve finished studying these flashcards!')
        self.driver.find_element_by_id('decks-home-btn').click()

        # Browse the new deck
        self.driver.find_element_by_class_name('other-btn').click()
        self.driver.find_element_by_class_name('browse-btn').click()
        self.assertTextExists('This deck has no flashcards yet.')
        self.driver.execute_script('window.history.go(-1)')

        # Create flashcards
        def create_flashcards():
            self.driver.find_element_by_class_name('add-cards-btn').click()

            original_flashcard_num = FlashCard.objects.count()
            original_review_instance_num = ReviewInstance.objects.count()
            self.driver.find_element_by_id('frontText').send_keys('front')
            self.driver.find_element_by_id('backText').send_keys('back')
            self.driver.find_element_by_id('tags').send_keys('tags')
            self.driver.find_element_by_id('create').click()
            self.sleep(3)
            self.assertEqual(FlashCard.objects.count(), original_flashcard_num + 1)
            self.assertEqual(ReviewInstance.objects.count(), original_review_instance_num + 1)

            self.click_option('reversed')
            self.driver.find_element_by_id('frontText').send_keys('reversed front')
            self.driver.find_element_by_id('backText').send_keys('reversed back')
            self.driver.find_element_by_id('create').click()
            self.sleep(3)
            self.assertEqual(FlashCard.objects.count(), original_flashcard_num + 2)
            self.assertEqual(ReviewInstance.objects.count(), original_review_instance_num + 3)

            self.click_option('cloze')
            self.driver.find_element_by_id('frontText').send_keys(
                '{{c1::example}} {{c2::cloze}} {{c3::flashcard}}'
            )
            self.driver.find_element_by_id('create').click()

            def test_cloze_created():
                return (
                    FlashCard.objects.count() == original_flashcard_num + 3 and
                    ReviewInstance.objects.count() == original_review_instance_num + 6
                )

            self.assert_for_n_seconds(test_cloze_created)

        create_flashcards()

        # Browse the deck
        self.driver.get(
            self.driver.find_element_by_id('browse-deck-btn').get_attribute('href')
        )
        self.sleep(1)
        self.assertTextInTitle('Browsing Flashcards')
        self.assertTextExists('front')
        self.assertTextExists('back')
        self.assertTextExists('reversed front')
        self.assertTextExists('reversed back')
        self.assertTextExists('{{c1::example}} {{c2::cloze}} {{c3::flashcard}}')

        # Study the deck
        def study_deck(deck):
            self.driver.get(
                self.driver.find_element_by_class_name('study-btn').get_attribute('href')
            )

            self.assertTextInTitle('Studying')
            self.assertEqual(
                self.driver.find_element_by_id('flashcards-remaining').text,
                '6 flashcards remaining',
            )

            num_learned = ReviewInstance.objects.filter(
                learning_status='LEARNED',
                flashcard__deck=deck,
            ).count()
            num_learning = ReviewInstance.objects.filter(
                learning_status='LEARNING',
                flashcard__deck=deck,
            ).count()

            for i in range(6):
                # Show the answer
                self.driver.find_element_by_id('showanswer').click()
                self.assertTextExists('Again')
                self.assertTextExists('Good', class_name='btn')
                self.assertTextExists('Easy')
                self.assertTextNotExists('Hard')

                def test_flashcard_studied(study_type, i):
                    def func():
                        return (
                            ReviewInstance.objects.filter(
                                learning_status=study_type,
                                flashcard__deck=deck,
                            ).count()
                            ==
                            i + 1 + (num_learned if study_type == 'LEARNED' else num_learning),
                        )

                    return func

                if i < 3:
                    # For the first half, press Easy
                    self.find_element_by_text('Easy').click()
                    self.assert_for_n_seconds(test_flashcard_studied('LEARNED', i))
                else:
                    # For the second half, press Good
                    self.find_element_by_text('Good', class_name='btn').click()
                    self.assert_for_n_seconds(test_flashcard_studied('LEARNING', i))

                flashcards_remaining = 6 - i - 1
                self.assert_for_n_seconds(
                    lambda: ReviewInstance.objects.filter(
                        learning_status='UNSEEN',
                        flashcard__deck=deck,
                    ).count()
                    ==
                    flashcards_remaining,
                )

                def test_remaining_text():
                    if flashcards_remaining > 0:
                        return (
                            self.driver.find_element_by_id('flashcards-remaining').text
                            ==
                            (
                                f'{flashcards_remaining} flashcards remaining'
                                if flashcards_remaining > 1 else
                                '1 flashcard remaining'
                            )
                        )
                    else:
                        try:
                            self.find_element_by_text(
                                'Congratulations! You\'ve finished studying these flashcards!',
                            )
                            self.driver.find_element_by_id('decks-home-btn').click()
                            return True
                        except NoSuchElementException:
                            return False
                self.assert_for_n_seconds(test_remaining_text)

        self.assertEqual(Deck.objects.count(), 1)
        deck = Deck.objects.first()  # type: Deck
        study_deck(deck)

        # Edit deck
        self.driver.find_element_by_class_name('other-btn').click()
        self.driver.find_element_by_class_name('edit-btn').click()

        self.fill_text_element('title', 'Edited selenium deck')
        self.click_option('EASY')
        self.fill_text_element('dailyNewCardLimit', '25')
        self.fill_text_element('dailySeenCardLimit', '100')
        self.click_button(html_id='toggle-advanced-options')
        self.driver.find_element_by_name('shuffleUnseenCards').click()
        self.fill_text_element('reviewAheadMinutes', '130')
        self.click_option('ANKI')
        self.driver.find_element_by_id('edit-create-deck').click()

        def test_deck_edited():
            deck.refresh_from_db()
            dssm = deck.study_session_manager  # type: DeckStudySessionManager
            return (
                deck.title == 'Edited selenium deck' and
                dssm.difficulty == 'EASY' and
                dssm.shuffle_unseen_cards is True and
                dssm.daily_new_card_limit == 25 and
                dssm.daily_seen_card_limit == 100 and
                dssm.review_ahead_minutes == 130 and
                dssm.scheduling_algorithm == 'ANKI'
            )
        self.assert_for_n_seconds(test_deck_edited)

        # Share deck
        self.driver.find_element_by_class_name('other-btn').click()
        self.driver.find_element_by_class_name('edit-btn').click()
        self.driver.find_element_by_class_name('make-public-btn').click()

        self.fill_text_element('title', 'Shared selenium deck')
        self.click_option('FRIENDS')

        self.assertEqual(
            SharedDeck.objects.count(),
            0,
        )
        self.driver.find_element_by_id('make-public').click()

        self.assertTextExists('Shared selenium deck')
        self.assertTextExists('Example Flashcards')
        self.assertTextExists('front')
        self.assertTextExists('back')
        self.assertTextExists('reversed front')
        self.assertTextExists('reversed back')
        self.assertTextExists('{{c1::example}} {{c2::cloze}} {{c3::flashcard}}')

        shared_deck = SharedDeck.objects.first()  # type: SharedDeck
        self.assertIsNotNone(shared_deck)
        self.assertEqual(shared_deck.title, 'Shared selenium deck')
        self.assertEqual(shared_deck.sharing_setting, 'FRIENDS')

        # Clone shared deck
        deck.user = self.users[1]
        shared_deck.user = self.users[1]  # forcibly change the owner of the shared deck
        shared_deck.sharing_setting = 'PUBLIC'
        deck.save()
        shared_deck.save()

        self.assertEqual(
            Deck.objects.filter(user=self.user).count(),
            0,
        )
        self.assertEqual(
            FlashCard.objects.filter(deck__user=self.user).count(),
            0,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck__user=self.user).count(),
            0,
        )

        self.driver.refresh()

        self.driver.find_element_by_id('copy-deck-btn').click()
        self.fill_text_element('destinationTitle', 'Cloned selenium deck')
        self.driver.find_element_by_id('copy-deck-submit-btn').click()
        self.assert_for_n_seconds(
            lambda:
            Deck.objects.filter(user=self.user).count() == 1 and
            FlashCard.objects.filter(deck__user=self.user).count() == 3 and
            ReviewInstance.objects.filter(flashcard__deck__user=self.user).count() == 6
        )
        cloned_deck = Deck.objects.filter(user=self.user).first()
        self.driver.get(f'{self.live_server_url}/home/decks/')
        self.sleep(1)
        study_deck(cloned_deck)

        # Update shared deck
        cloned_deck.user = self.users[1]
        cloned_deck.save()
        shared_deck.user = self.user
        shared_deck.save()
        deck.user = self.user
        deck.shared_deck = shared_deck
        deck.save()

        self.driver.get(f'{self.live_server_url}/home/decks/')
        self.sleep(1)
        create_flashcards()

        self.driver.get(f'{self.live_server_url}/home/decks/')
        self.driver.find_element_by_class_name('other-btn').click()
        self.driver.find_element_by_class_name('edit-btn').click()
        self.driver.find_element_by_class_name('make-public-btn').click()
        self.driver.find_element_by_id('push-changes').click()
        self.sleep(0.1)

        self.assertEqual(
            self.driver.find_element_by_class_name('text-success').text,
            'Created 3 flashcards',
        )
        self.assertEqual(
            self.driver.find_element_by_class_name('text-primary').text,
            'Modified 0 flashcards',
        )
        self.assertEqual(
            self.driver.find_element_by_class_name('text-danger').text,
            'Deleted 0 flashcards',
        )

        self.assertEqual(
            FlashCard.objects.filter(deck=shared_deck).count(),
            3,
        )
        self.assertEqual(shared_deck.version_number, 0)
        self.driver.find_element_by_id('push-changes').click()

        def test_updated_deck():
            shared_deck.refresh_from_db()
            return (
                FlashCard.objects.filter(deck=shared_deck).count() == 6 and
                shared_deck.version_number == 1
            )
        self.assert_for_n_seconds(test_updated_deck)

        # Pull shared deck updates
        cloned_deck.user = self.user
        cloned_deck.save()
        shared_deck.user = self.users[1]
        shared_deck.save()
        deck.user = self.users[1]
        deck.shared_deck = shared_deck
        deck.save()

        self.driver.get(f'{self.live_server_url}/home/decks/')
        self.driver.find_element_by_class_name('other-btn').click()
        self.driver.find_element_by_class_name('edit-btn').click()
        self.driver.find_element_by_class_name('update-btn').click()

        self.assertTextExists('Shared selenium deck')
        self.assertEqual(
            FlashCard.objects.filter(deck=cloned_deck).count(),
            3,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count(),
            6,
        )
        self.assertEqual(cloned_deck.shared_deck_relations.first().cloned_at_version, 0)

        self.driver.find_element_by_class_name('update-btn').click()

        def test_cloned_deck_updated():
            cloned_deck.refresh_from_db()
            return (
                FlashCard.objects.filter(deck=cloned_deck).count() == 6 and
                ReviewInstance.objects.filter(flashcard__deck=cloned_deck).count() == 12 and
                cloned_deck.shared_deck_relations.first().cloned_at_version == 1
            )
        self.assert_for_n_seconds(test_cloned_deck_updated)

        self.driver.get(f'{self.live_server_url}/home/decks/')
        self.sleep(1)
        study_deck(cloned_deck)

        cloned_deck = Deck.objects.get(pk=cloned_deck.pk)
        self.assertEqual(
            ReviewInstance.objects.filter(
                flashcard__deck=cloned_deck,
                learning_status='LEARNED',
            ).count(),
            6,
        )
        self.assertEqual(
            ReviewInstance.objects.filter(
                flashcard__deck=cloned_deck,
                learning_status='LEARNING',
            ).count(),
            6,
        )
