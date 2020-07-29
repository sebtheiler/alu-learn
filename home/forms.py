from django import forms
from .models import Deck, FlashCard, Tag

MAX_DECK_TITLE_LENGTH = 128

class DeckForm(forms.ModelForm):
    class Meta:
        model = Deck
        fields = ['title']
    
    def clean_content(self):
        content = self.cleaned_data.get('content')
        if len(content) > MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")