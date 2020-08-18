from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Profile, Notification
from ..serializers import PublicProfileSerializer, NotificationSerializer


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
        Whether the current user is a friend of the given user, None/null if the current user is the user: 'is_friend'

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
        data = request.data or {}
        action = data.get('action')
        if action == 'friend':
            if profile_obj.user == request.user:
                return Response({'message': 'You cannot friend yourself'}, status=400)
            if not request.user in profile_obj.friends.all():
                # Add eachother as friends
                profile_obj.friends.add(request.user)
                request.user.profile.friends.add(profile_obj.user)

                # Remove eachother as pending friends
                # Technical note: only one user will have the other as
                # a pending friend, however it is simply easier to do this
                # to both of them.  This may reduce efficiency, TODO:
                profile_obj.pending_friends.remove(request.user.profile)
                request.user.profile.pending_friends.remove(profile_obj)
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

    context = PublicProfileSerializer(instance=profile_obj, context={'request': request}).data
    return Response(context, status=200)


@api_view(['POST'])
def friend_request_api_view(request, recipient_username, *args, **kwargs):
    """
    Send a friend request to a user with username `recipient_username`

    Required information:
        `recipient_username`: (URL) Username of the user to send a friend request to
    
    Possible errors:
        Unknown username: 404, {message: 'User "`username`" not found'}
        Cannot self-friend: 400, {message: 'You cannot friend yourself'}
    """
    # Get recipient user
    user_qs = User.objects.filter(username=recipient_username) # TODO: turn this common snippet of getting user into function
    if not user_qs.exists():
        return Response({'message': f'User "{recipient_username}" not found'}, status=404)
    recipient_user = user_qs.first()

    # Get sending user 
    sending_user = request.user

    if sending_user == recipient_user:
        return Response({'message': 'You cannot friend yourself'}, status=400)

    # Create notification
    title = f'{sending_user.first_name} wants to be your friend!' if sending_user.first_name else 'Someone wants to be your friend!'
    if sending_user.first_name:
        if sending_user.last_name:
            description = f'{sending_user.first_name} {sending_user.last_name}'
        else:
            description = f'{sending_user.first_name}'
        description += ' '
    else:
        description = ''
    description += f'[@{sending_user.username}](/profiles/u/{sending_user.username}) wants to be your friend'

    Notification.objects.create(
        profile=recipient_user.profile,
        category='friend_request',
        title=title,
        description=description,
    )

    # Put user in the profile's pending friends
    recipient_user.profile.pending_friends.add(
        sending_user.profile,
    )
    recipient_user.save()

    return Response({}, status=201)


@api_view(['GET', 'POST'])
def notification_api_view(request, username, *args, **kwargs):
    """
    Get notifications for a user, or create notifications - GET/POST

    To get list of notifications, use request method GET
    
    To add a notification,
        Use request method POST
        Request data must have attributes:
            `title`: Title of the notification
            `description`: Description/content of the notification

    Returns:
        `profile`: The serialized profile the notification belongs to
        `title`: Title of the newly created notification
        `description`: Description of the newly created notification

    Possible errors:
        Unknown username: 404, {message: 'User "`username`" not found'}
    """
    # Get user
    user_qs = User.objects.filter(username=username) # TODO: turn this common snippet of getting user into function
    if not user_qs.exists():
        return Response({'message': f'User "{username}" not found'}, status=404)
    user = user_qs.first()

    if request.method == 'POST':
        # Create notification object
        notif = Notification.objects.create(
            profile=user.profile,
            title=request.data.get('title'),
            description=request.data.get('description'),
            category=request.data.get('category'),
        )
        return Response(NotificationSerializer(instance=notif).data, status=201)
    elif request.method == 'GET':
        # List all notifications
        return Response(NotificationSerializer(
            Notification.objects.filter(profile__user=user),
            many=True,
        ).data, status=200)
    else:
        return Response({'message': f'Method {request.method} not allowed'}, status=405)


@api_view(['GET', 'POST'])
def notification_read_api_view(request, username, *args, **kwargs):
    """
    Get unread notifications for a user, or mark notifications as read - GET/POST

    To get list of notifications, use request method GET
    
    To mark a notification as read,
        Use request method POST
        Request data must have attributes:
            `notification_id`

    Returns:
        `profile`: The serialized profile the notification belongs to
        `title`: Title of the newly created notification
        `description`: Description of the newly created notification

    Possible errors:
        Unknown username: 404, {message: 'User not found'}
    """
    # Get user
    user_qs = User.objects.filter(username=username) # TODO: turn this common snippet of getting user into function
    if not user_qs.exists():
        return Response({'message': 'User not found'}, status=404)
    user = user_qs.first()

    if request.method == 'POST':
        # Get notification
        pk = request.data.get('notification_id')
        if not pk:
            return Response({'message': 'Please specify a notification ID'}, status=400)
        notif_qs = Notification.objects.filter(profile__user=user, pk=pk)
        if not notif_qs.exists():
            return Response({'message': 'Please specify a valid notification ID'}, status=400)
        notif = notif_qs.first()
        # Mark notification as read
        notif.read = True
        notif.save()
        return Response(NotificationSerializer(instance=notif).data, status=200)
    elif request.method == 'GET':
        # List all unread notifications
        return Response(NotificationSerializer(
            Notification.objects.filter(profile__user=user, read=False),
            many=True,
        ).data, status=200)
    else:
        return Response({'message': f'Method {request.method} not allowed'}, status=405)
