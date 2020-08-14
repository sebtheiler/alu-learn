from django.contrib.auth import get_user_model
from rest_framework import authentication

User = get_user_model()

class DevAuthentication(authentication.BasicAuthentication):
    def authenticate(self, request):
        user_qs = User.objects.all()

        # Random user
        # user = user_qs.order_by('?').first()

        # Specific username
        user = user_qs.filter(username='testuser').first()

        return (user, None)
