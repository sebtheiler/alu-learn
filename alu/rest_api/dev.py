from django.contrib.auth import get_user_model
from rest_framework import authentication


User = get_user_model()

class DevAuthentication(authentication.BasicAuthentication):
    def authenticate(self, request):
        user_qs = User.objects.all()
        user = user_qs.order_by('?').first()
        return (user, None)