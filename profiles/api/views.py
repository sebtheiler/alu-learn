from django.http import JsonResponse
from django.utils.http import is_safe_url
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Profile, Notification, ProfileBadge
from ..serializers import PublicProfileSerializer, MinifiedProfileSerializer, NotificationSerializer, ProfileBadgeSerializer, HistorySerializer
from analytics.models import ExperimentController

import datetime

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
@permission_classes([IsAuthenticated])
def friend_request_api_view(request, recipient_username, *args, **kwargs):
    """
    Send a friend request to a user with username `recipient_username`

    Required information:
        `recipient_username`: (URL) Username of the user to send a friend request to
    
    Possible errors:
        Unknown username: 404, {'message': 'User "`username`" not found'}
        Cannot self-friend: 400, {'message': 'You cannot friend yourself'}
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


@api_view(['POST'])
def profile_badge_create_api_view(request, username, *args, **kwargs):
    """
    Give a profile a badge - POST

    Required information:
        `username`: (URL) Username of the profile to give a badge to
        `identifier`: (Data) Identifier of the badge to give. This is from a given list in `alu-web/badges/identifiers.js`, however is not verified upon creation.
    
    Possible errors:
        Unknown username: 404, User not found
        Not identifier specified: 400, Identifier not specified
    """
    identifier = request.data.get('identifier')
    if identifier is None:
        return Response({'message': 'Identifier not specified'}, status=400)

    profiles_qs = Profile.objects.filter(user__username=username)
    if not profiles_qs.exists():
        return Response({'message': 'User not found'}, status=404)
    profile = profiles_qs.first()

    new_badge = ProfileBadge.objects.create(profile=profile, identifier=identifier)
    return Response(ProfileBadgeSerializer(new_badge).data, status=201)

@api_view(['GET'])
# TODO: make another view for checking emails
def check_username_available_api_view(request, *args, **kwargs):
    """
    Check if a username is available - GET

    Required information:
        `username`: (GET) Username to check
    
    Possible errors:
        Username not specified: 400, {'message': 'Please specify username'}
    """
    username = request.GET.get('username')
    if username is None:
        return Response({'message': 'Please specify username'}, status=400)
    
    all_usernames = [user.username for user in User.objects.all()]
    is_available = username not in all_usernames
    return Response({'is_available': is_available}, status=200)

@api_view(['POST'])
def create_profile_api_view(request, *args, **kwargs):
    """
    Create a profile - POST

    Requried information:
        `birthdate`: Birthdate. Must have date, month, and year
        `first_name`: First name of profile, None if the user is a child
        `last_name`: (Optional) Last name of profile
        `username`: Username of profile
        `email`: Email of profile. Email of parent if user is child.
        `password`: Password of user
        `experiment_params`: Experiment paramaters for analytics apps
    """
    # Get data
    birthdate = request.data.get('birthdate')
    last_name = request.data.get('last_name')
    first_name = request.data.get('first_name')
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    experiment_params = request.data.get('experiment_params')

    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    birthdate = datetime.date(
        year=birthdate.get('year'),
        month=months.index(birthdate.get('month').lower()),
        day=birthdate.get('day'),
    )

    # Create user
    user = User.objects.create_user(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password=password,
        email=email,
    )

    user.profile.birthdate = birthdate
    user.profile.save()

    # Add data to the analytics tracker
    controller = ExperimentController.objects.get(short_name='landing1')
    controller.add_data_piece(parameters=experiment_params, successful=True)

    return Response(PublicProfileSerializer(user.profile).data, status=201)


@api_view(['POST'])
def login_api_view(request, *args, **kwargs):
    """
    Logs a user in - POST

    Required information:
        `username`: Username of user
        `password`: Raw password of user
    
    Possible errors:
        User is already authenticated: 400, {'message': 'User is already authenticated'}
        `username` or `password` not supplied: 400, {'message': 'Please specify a username and password'}
        Invalid credentials: 401, {'message': 'Invalid credentials'}
    """
    if request.user.is_authenticated:
        return Response({'message': 'User is already authenticated'}, status=400)

    username = request.data.get('username')
    password = request.data.get('password')
    if username is None or password is None:
        return Response({'message': 'Please specify a username and password'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'message': 'Invalid credentials'}, status=401)
    login(request, user)

    return Response({'message': 'Successfully authenticated user'}, status=200)


@api_view(['POST'])
def logout_api_view(request, *args, **kwargs):
    """
    Logs out a user - POST

    Possible errors:
        User is not logged in: 400, {'message': 'User is not logged in'}
    """
    if not request.user.is_authenticated:
        return Response({'message': 'User is not logged in'}, status=400)
    logout(request)
    return Response({'message': 'Successfully unauthenticated user'}, status=200)


@api_view(['GET'])
def get_user_friends_api_view(request, username, *args, **kwargs):
    """
    Gets a user's friends - GET

    Possible errors:
        Invalid username: 404, {'message': 'User not found'}
    """
    try:
        # TODO: replace all segments of code to something like this
        profile = Profile.objects.get(user__username=username)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)
    return Response(MinifiedProfileSerializer(profile.friends, many=True).data, status=200)


@api_view(['GET'])
def profile_history_view(request, username, *args, **kwargs):
    """
    Gets a user's history - GET

    Possible errors:
        Invalid username: 404, {'message': 'User not found'}
    """
    try:
        # TODO: replace all segments of code to something like this
        profile = Profile.objects.get(user__username=username)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)
    return Response(HistorySerializer(profile.history, many=True).data, status=200)

# from django.core.mail import send_mail
# from django.conf import settings
# @api_view(['GET'])
# def test_my_email_api_view(request, *args, **kwargs):
#     subject = 'Thank you for registering to our site'
#     message = 'Body text Body text Body text Body text Body text'
#     email_from = settings.EMAIL_HOST_USER
#     recipient_list = ['sebastiantk9@gmail.com',] # TODO: clean up this sensitive line

#     return Response(
#         send_mail(
#             subject,
#             message,
#             email_from,
#             recipient_list,
#             fail_silently=False,
#         ))
