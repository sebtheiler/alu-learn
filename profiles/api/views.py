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
def profile_detail_api_view(request, username, *args, **kwargs):
    """
    Get detail about a profile with username `username`, or add/remove them as a friend - GET/POST

    To get details about a profile, use request method GET
    
    To add/remove another user as a friend,
        Use request method POST
        Request data must have an attribute `action`.  This must either be `friend` or `unfriend`

    Returns:
        First name of the given user: 'first_name'
        Last name of the given user: 'last_name'
        Username of the given user: 'username'
        ID of the given user: 'id'
        Bio of the given user: 'bio'
        Location of the given user: 'location'
        Number of friends of the given user: 'friend_count'
        Whether the current user is a friend of the given user: 'is_friend'

    Possible errors:
        Unknown username: 404, {message: 'User not found'}
        Already friends when adding friend: 400, {message: 'You are already friends with this user'}
        Unfriending user who is not a friend: 400 {message: 'You cannot unfriend a user who is not your friend'}
        Action is not friend/unfriend: 400, {message: 'Unknown action'}
        Adding yourself as a friend: 400, {message: 'You cannot friend yourself'}
    """
    # Find the user in question
    profile_qs = Profile.objects.filter(user__username=username)
    if not profile_qs.exists():
        return Response({'message': 'User not found'}, status=404)
    profile_obj = profile_qs.first()

    # Logic for adding/removing friends
    if request.method == 'POST':
        if profile_obj.user != request.user:
            data = request.data or {}
            action = data.get('action')
            if action == 'friend':
                if not request.user in profile_obj.friends.all():
                    # Add eachother as friends
                    profile_obj.friends.add(request.user)
                    request.user.profile.friends.add(profile_obj.user)
                else:
                    return Response({'message': 'You are already friends with this user'}, status=400)
            elif action == 'unfriend':
                if request.user in profile_obj.friends.all():
                    # Remove eachother as friends
                    profile_obj.friends.remove(request.user)
                    request.user.profile.friends.remove(profile_obj.user)
                else:
                    return Response({'message': 'You cannot unfriend a user who is not your friend'}, status=400)
            else:
                return Response({'message': 'Unknown action'}, status=400)
        else:
            return Response({'message': 'You cannot friend yourself'}, status=400)

    context = PublicProfileSerializer(instance=profile_obj, context={'request': request}).data
    return Response(context, status=200)

# Old view, should be deleted soon
# @api_view(['GET', 'POST'])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# def user_friend_view(request, username, *args, **kwargs):
#     current_user = request.user
#     to_friend_user_qs = User.objects.filter(username=username)
#     if current_user.username == username:
#         return Response({'message': 'You cannot friend yourself'}, status=400)

#     if not to_friend_user_qs.exists():
#         return Response({}, status=404)

#     to_friend_user = to_friend_user_qs.first()
#     profile = to_friend_user.profile
#     data = request.data or {}
#     action = data.get('action')
#     if action == 'friend':
#         profile.friends.add(current_user)
#     elif action == 'unfriend':
#         if current_user in profile.friends.all():
#             profile.friends.remove(current_user)
#         else:
#             return Response({'message': 'You cannot unfriend a user who is not your friend'})
#     else:
#         return Response({'message': 'Unknown action'}, status=400)

#     context = PublicProfileSerializer(instance=profile_obj, context={'request': request}).data
#     return Response(context, status=200)