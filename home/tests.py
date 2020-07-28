from django.test import TestCase
from .models import Tag, FlashCard, Deck

# Create your tests here.
def create_deck():
    return Deck.objects.create()

class DeckModelTests(TestCase):
    pass


def create_flashcard(front_text, back_text):
    deck = create_deck()
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