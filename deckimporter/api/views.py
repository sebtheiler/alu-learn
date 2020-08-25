from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser

from django.utils import timezone
from decks.models import Deck, FlashCard
from profiles.models import Profile


@api_view(['POST'])
def txt_file_upload(request, *args, **kwargs):
    deck_title = request.data.get('deck_title')
    uploaded_file = request.data.get('uploaded_file')
    split_lines = uploaded_file.split('\n')
    front_and_back = [line.split('\t') for line in split_lines if line]

    user = Profile.objects.all().first().user # TODO: change to request.user
    deck, created = Deck.objects.get_or_create(user=user, title=deck_title)

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

    return Response({}, status=201)
