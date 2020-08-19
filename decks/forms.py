from django import forms
from django.conf import settings

from .models import Deck, FlashCard


# Backend of form for creating deck
# This is displayed at the top of the home page
class DeckForm(forms.ModelForm):
    class Meta:
        model = Deck
        fields = ['title']
    
    def clean_content(self):
        content = self.cleaned_data.get('content')
        if len(content) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")
