from django.contrib.auth import get_user_model
from rest_framework import authentication

User = get_user_model()


class DevAuthentication(authentication.BasicAuthentication):
    def authenticate(self, request):
        username = 'evolvedsquid'
        # username = 'testuser'
        user = User.objects.get(username=username)

        return (user, None)
