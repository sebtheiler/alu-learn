from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Profile
from ..serializers import PublicProfileSerializer


User = get_user_model()

@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def user_friend_view(request, username, *args, **kwargs):
    current_user = request.user
    to_friend_user_qs = User.objects.filter(username=username)
    if current_user.username == username:
        return Response({'message': 'You cannot friend yourself'}, status=400)

    if not to_friend_user_qs.exists():
        return Response({}, status=404)

    to_friend_user = to_friend_user_qs.first()
    profile = to_friend_user.profile
    data = request.data or {}
    action = data.get('action')
    if action == 'friend':
        profile.friends.add(current_user)
    elif action == 'unfriend':
        if current_user in profile.friends.all():
            profile.friends.remove(current_user)
        else:
            return Response({'message': 'You cannot unfriend a user who is not your friend'})
    else:
        return Response({'message': 'Unknown action'}, status=400)

    current_followers_qs = profile.friends.all()
    return Response({'friend_count': current_followers_qs.count()}, status=200)

@api_view(['GET'])
def profile_detail_api_view(request, username, *args, **kwargs):
    profile_qs = Profile.objects.filter(user__username=username)
    if not profile_qs.exists():
        return Response({'message': 'User not found'}, status=404)
    profile_obj = profile_qs.first()
    context = PublicProfileSerializer(instance=profile_obj, context={'request': request}).data
    return Response(context, status=200)