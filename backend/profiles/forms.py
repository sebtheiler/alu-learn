from django import forms
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


# Form for editing a profile
class ProfileForm(forms.ModelForm):
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'bio']