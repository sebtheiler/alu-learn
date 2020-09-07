from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser

from django.utils import timezone
from decks.models import Deck, FlashCard
from decks.serializers import DeckSerializer
from profiles.models import Profile
from rest_framework.permissions import IsAuthenticated


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def txt_file_upload(request, *args, **kwargs):
    """
    Import a deck from a .txt file - POST

    Required information:
        deck_title: Title of the deck to create
        uploaded_file: Contents of the uploaded file
    """
    # Get information
    deck_title = request.data.get('deck_title')
    uploaded_file = request.data.get('uploaded_file')

    # Parse text document
    split_lines = uploaded_file.split('\n')
    front_and_back = [line.split('\t') for line in split_lines if line]

    # Get/create deck with given title
    deck, created = Deck.objects.get_or_create(user=request.user, title=deck_title)

    # Create flashcards
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)
    flashcards = [
        FlashCard(
            deck=deck,
            front_text=front,
            back_text=back,
            next_review=this_morning,
        )
        for front, back in front_and_back
    ]
    FlashCard.objects.bulk_create(flashcards)

    # Return
    return Response(DeckSerializer(deck).data, status=201)
