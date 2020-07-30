from django import forms
from .models import Deck, FlashCard, Tag
from django.conf import settings

class DeckForm(forms.ModelForm):
    class Meta:
        model = Deck
        fields = ['title']
    
    def clean_content(self):
        content = self.cleaned_data.get('content')
        if len(content) > settings.MAX_DECK_TITLE_LENGTH:
            raise forms.ValidationError("Your deck's title is too long!")