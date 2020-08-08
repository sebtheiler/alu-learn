import random

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Deck, FlashCard, Tag

# Create your tests here.
User = get_user_model()

def create_deck(deck_title, user=None):
    if user is None:
        user = User.objects.create_user(username='User', password='abc123')
    return Deck.objects.create(title=deck_title, user=user)

class DeckModelTests(TestCase):
    def setUp(self):
        # Create random users
        self.num_users = 5
        self.users = []
        for i in range(self.num_users):
            self.users.append(User.objects.create_user(username='User - ' + str(i), password='p@ssword'))

        # Create a deck for each user
        self.num_decks = 5
        self.decks = []
        for i in range(self.num_decks):
            self.decks.append(Deck.objects.create(title='Deck - ' + str(i), user=self.users[i % self.num_decks]))
    
    def test_user_created(self):
        self.assertEqual(User.objects.count(), self.num_users)
        self.assertEqual(len(self.users), self.num_users)
    
    def test_deck_created(self):
        deck = create_deck('Deck', self.users[0])
        self.assertEqual(deck.title, 'Deck')
        self.assertEqual(deck.user, self.users[0])
        self.assertEqual(deck.id, self.num_decks + 1)
    
    def get_client(self, user_id=0):
        client = APIClient()
        if user_id is not None:
            client.login(username=self.users[user_id].username, password='p@ssword')
        return client

    def test_deck_list(self):
        client = self.get_client()
        response = client.get('/api/decks/decklist/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json().get('results')), self.num_decks)
    
    def test_decks_related_name(self):
        user = self.users[0]
        self.assertEqual(user.decks.count(), 1)
    
    def test_deck_created_api_view(self):
        previous_deck_count = Deck.objects.count()
        request_data = {'title': 'My deck'}
        client = self.get_client()
        response = client.post('/api/decks/create/', request_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Deck.objects.count() - 1, previous_deck_count)

    def test_deck_created_unauthorized_api_view(self):
        previous_deck_count = Deck.objects.count()
        request_data = {'title': 'My deck'}
        client = self.get_client(None)
        response = client.post('/api/decks/create/', request_data)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Deck.objects.count(), previous_deck_count)

    def test_deck_detail_api_view(self):
        client = self.get_client()
        response = client.get('/api/decks/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('id'), 1)
    
    # def test_deck_detail_unauthorized_api_view(self):
    #     client = self.get_client(None)
    #     response = client.get('/api/decks/1/')
    #     self.assertEqual(response.status_code, 403)

    def test_delete_api_view(self):
        client = self.get_client()
        response = client.delete('/api/decks/1/delete/')
        self.assertEqual(response.status_code, 200)
        client = self.get_client()
        response = client.delete('/api/decks/1/delete/')
        self.assertEqual(response.status_code, 404)

    def test_delete_unauthorized_api_view(self):
        client = self.get_client(1)
        response = client.delete(f'/api/decks/1/delete/')
        self.assertEqual(response.status_code, 401)

    def test_string(self):
        self.assertEqual(str(create_deck('My First Deck')), 'My First Deck')


def create_flashcard(front_text, back_text):
    deck = create_deck('Deck')
    return FlashCard.objects.create(deck=deck, front_text=front_text, back_text=back_text)

class FlashCardModelTests(TestCase):
    def test_string(self):
        self.assertEqual(str(create_flashcard('Powerhouse of the cell', 'Mitochondria')), 'Powerhouse of the cell  ---  Mitochondria')


def create_tag(text):
    flashcard = create_flashcard('26th President', 'Teddy Roosevelt')
    return Tag.objects.create(flashcard=flashcard, tag_text=text)

class TagModelTests(TestCase):
    def test_string(self):
        self.assertEqual(str(create_tag('Presidents')), 'Presidents')
