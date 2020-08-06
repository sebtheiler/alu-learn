from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Profile


User = get_user_model()

@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def user_friend_view(request, username, *args, **kwargs):
    current_user = request.user
    to_friend_user_qs = User.objects.filter(username=username)
    if not to_friend_user_qs.exists():
        return Response({}, status=404)
    to_friend_user = to_friend_user_qs.first()
    profile = to_friend_user.profile
    data = request.data or {}
    action = data.get('action')
    if action == 'add_friend':
        profile.friends.add(current_user)
    elif action == 'remove_friend':
        profile.friends.remove(current_user)
    else:
        pass

    current_followers_qs = profile.friends.all()
    return Response({'friend_count': current_followers_qs.count()}, status=200)
