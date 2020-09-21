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
from decks.api.utils import get_paginated_queryset_response
from django.shortcuts import redirect

import datetime

User = get_user_model()


@api_view(['GET'])
def profile_detail_api_view(request, username, *args, **kwargs):
    """
    Get detail about a profile with username `username` - GET

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
        Unknown username: 404, User not found
    """
    # Find the user in question
    try:
        profile = Profile.objects.get(user__username=username.lower())

        return Response(PublicProfileSerializer(profile, context={'request': request}).data, status=200)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_toggle_api_view(request, recipient_username, *args, **kwargs):
    """
    Adds or removes a friend - POST

    Required information:
        `recipient_username`: The username of the user who launched the friend request

    Possible errors:
        Recipient profile not found: 404, User not found
        Already friends when adding friend: 400, You are already friends with this user
        Unfriending user who is not a friend: 400 You cannot unfriend a user who is not your friend
        Action is not friend/unfriend: 400, Unknown action
        Adding yourself as a friend: 400, You cannot friend yourself
        Friend a user who has not requested you: 400, You cannot friend a user who has not requested to be your friend
    """
    # Find the user in question
    try:
        recipient_user = User.objects.get(username=recipient_username.lower())
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    # Get action
    action = request.data.get('action')
    if action is None:
        return Response({'message': 'You must specify an action'})

    # Friending logic
    if action == 'friend':
        if recipient_user == request.user:
            return Response({'message': 'You cannot friend yourself'}, status=400)

        if not request.user in recipient_user.profile.friends.all():
            recipient_is_pending = recipient_user in request.user.profile.pending_friends.all()
            if recipient_is_pending:
                # Add eachother as friends
                recipient_user.profile.friends.add(request.user)
                request.user.profile.friends.add(recipient_user)

                # Remove the user as a pending friend
                request.user.profile.pending_friends.remove(recipient_user)
            else:
                return Response({'message': 'You cannot friend a user who has not requested to be your friend'}, status=400)
        else:
            return Response({'message': 'You are already friends with this user'}, status=400)
    elif action == 'unfriend':
        if request.user in recipient_user.profile.friends.all():
            # Remove eachother as friends
            recipient_user.profile.friends.remove(request.user)
            request.user.profile.friends.remove(recipient_user)
        else:
            return Response({'message': 'You cannot unfriend a user who is not your friend'}, status=400)
    else:
        return Response({'message': 'Unknown action'}, status=400)
    
    return Response(PublicProfileSerializer(recipient_user.profile, context={'request': request}).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_request_api_view(request, recipient_username, *args, **kwargs):
    """
    Send a friend request to a user with username `recipient_username`

    Required information:
        `recipient_username`: (URL) Username of the user to send a friend request to
    
    Possible errors:
        Unknown username: 404, User "`username`" not found
        Cannot self-friend: 400, You cannot friend yourself
    """
    # Get recipient user
    user_qs = User.objects.filter(username=recipient_username.lower())
    if not user_qs.exists():
        return Response({'message': f'User "{recipient_username}" not found'}, status=404)
    recipient_user = user_qs.first()

    # Get sending user 
    sending_user = request.user
    if sending_user == recipient_user:
        return Response({'message': 'You cannot friend yourself'}, status=400)

    # Check if the users are already pending eachother
    if sending_user in recipient_user.profile.pending_friends.all():
        return Response({'message': 'You have already sent a friend request to this user'})
    elif recipient_user in sending_user.profile.pending_friends.all():
        # If the recipient user has already requested the sending user,
        # directly add them as friends
        recipient_user.profile.friends.add(sending_user)
        sending_user.profile.friends.add(recipient_user)
        sending_user.profile.pending_friends.remove(recipient_user)

        return Response(PublicProfileSerializer(recipient_user.profile).data, status=201) # for consistency with friend toggle view

    # Put user in the profile's pending friends
    recipient_user.profile.pending_friends.add(sending_user)
    recipient_user.save()

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

    return Response({'message': 'Request sent succesfully'}, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
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
        Unknown username: 404, User "`username`" not found
    """
    # Get user
    # try:
    #     user = User.objects.get(username=username.lower())
    # except ObjectDoesNotExist:
    #     return Response({'message': f'User "{username}" not found'}, status=404)
    user = request.user

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
        notif_qs = Notification.objects.filter(profile__user=user).order_by('-timestamp')

        return get_paginated_queryset_response(
            notif_qs,
            request,
            NotificationSerializer,
            page_size=3,
            other_information={'total_unread': notif_qs.filter(read=False).count()},
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_read_api_view(request, username, *args, **kwargs):
    """
    Get unread notifications for a user, or mark notifications as read - GET/POST

    To get list of notifications, use request method GET
    
    To mark a notification as read,
        Use request method POST
        Request data must have attributes:
            `notification_id` (this can also be a list of multiple notifications)

    Returns:
        `profile`: The serialized profile the notification belongs to
        `title`: Title of the newly created notification
        `description`: Description of the newly created notification

    Possible errors:
        Unknown username: 404, User not found
    """
    # Get user
    try:
        user = User.objects.get(username=username.lower())
    except ObjectDoesNotExist:
        return Response({'message': f'User "{username}" not found'}, status=404)

    if request.method == 'POST':
        notification_id = request.data.get('notification_id')
        if isinstance(notification_id, int):
            # Get notification
            try:
                notif = Notification.objects.get(profile__user=user, pk=notification_id)
            except ObjectDoesNotExist:
                return Response({'message': 'Please specify a valid notification ID'}, status=400)

            # Mark notification as read
            notif.read = True
            notif.save()

            return Response(NotificationSerializer(instance=notif).data, status=200)
        elif isinstance(notification_id, list):
            # Get notifications
            notifs = Notification.objects.filter(pk__in=notification_id)

            # Mark notifications as read
            notifs.update(read=True)

            return Response(NotificationSerializer(instance=notifs, many=True).data, status=200)
        else:
            return Response({'message': f'Please specify (a) notification ID(s)'}, status=400)
    elif request.method == 'GET':
        # List all unread notifications
        return Response(NotificationSerializer(
            Notification.objects.filter(profile__user=user, read=False),
            many=True,
        ).data, status=200)


@api_view(['GET'])
def check_username_available_api_view(request, *args, **kwargs):
    """
    Check if a username or email is available - GET

    Required information:
        `username`: (GET) Username to check
        `email`: (GET) Email to check

    Possible errors:
        Username not specified: 400, Please specify username
    """
    username = request.GET.get('username').lower()
    email = request.GET.get('email')
    if None in (username, email):
        return Response({'message': 'Please specify username and email'}, status=400)
    
    all_usernames_and_emails = [(user.username, user.email) for user in User.objects.all()]
    username_is_available = not username in [x[0] for x in all_usernames_and_emails]
    email_is_available = not email in [x[1] for x in all_usernames_and_emails]

    return Response({'username_is_available': username_is_available, 'email_is_available': email_is_available}, status=200)

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
    username = request.data.get('username').lower().replace('@', '').replace('$', '').replace('#', '')
    email = request.data.get('email')
    password = request.data.get('password')
    experiment_params = request.data.get('experiment_params')

    if None in (birthdate, last_name, first_name, username, email, password, experiment_params):
        return Response({'message': 'Not all parameters were specified'}, status=400)

    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    birthdate = datetime.date(
        year=birthdate.get('year'),
        month=months.index(birthdate.get('month').lower()) + 1,
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

    # Send confirmation email
    subject = 'Welcome to Alu!'
    message = f"""
We're glad you signed up.
Here's a confirmation code, to make sure this email is really you: {user.confirmation_key}
If this wasn't you, you can safely ignore this email.
    """
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]

    send_mail(
        subject,
        message,
        email_from,
        recipient_list,
        fail_silently=False,
    )

    return Response(PublicProfileSerializer(user.profile).data, status=201)


@api_view(['POST'])
def login_api_view(request, *args, **kwargs):
    """
    Logs a user in - POST

    Required information:
        `username`: Username of user
        `password`: Raw password of user
    
    Possible errors:
        User is already authenticated: 400, User is already authenticated
        `username` or `password` not supplied: 400, Please specify a username and password
        Invalid credentials: 401, Invalid credentials
    """
    if request.user and request.user.is_authenticated:
        return Response({'message': 'User is already authenticated'}, status=400)

    username = request.data.get('username').lower()
    password = request.data.get('password')
    if None in (username, password):
        return Response({'message': 'Please specify a username and password'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'message': 'Invalid credentials'}, status=401)
    login(request, user)

    return Response({'message': 'Successfully authenticated user'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api_view(request, *args, **kwargs):
    """
    Logs out a user - POST
    """
    logout(request)
    return Response({'message': 'Successfully unauthenticated user'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request, *args, **kwargs):
    """
    Changes a user's password - POST

    Required information:
        `old_password`: (Data) The user's current password
        `new_password`: (Data) Password to be changed to

    Possible errors:
        Old password invalid: 401, Invalid credentials
    """
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    if None not in (old_password, new_password):
        user = authenticate(username=request.user.username, password=old_password)
        if user is None:
            return Response({'message': 'Invalid credentials'}, status=401)
        else:
            user.set_password(new_password)
            user.save()

            return redirect('/login/')
    else:
        return Response({'message': 'You must specify `old_password` and `new_password`'}, status=400)


@api_view(['GET'])
def get_user_friends_api_view(request, username, *args, **kwargs):
    """
    Gets a user's friends - GET

    Possible errors:
        Invalid username: 404, User not found
    """
    try:
        profile = Profile.objects.get(user__username=username.lower())
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    return Response(MinifiedProfileSerializer(profile.friends, many=True).data, status=200)


@api_view(['GET'])
def profile_history_view(request, username, *args, **kwargs):
    """
    Gets a user's history - GET

    Possible errors:
        Invalid username: 404, User not found
    """
    try:
        profile = Profile.objects.get(user__username=username.lower())
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    return Response(HistorySerializer(profile.history, many=True).data, status=200)

from django.conf import settings
from django.core.mail import send_mail
# @api_view(['GET'])
# def test_my_email_api_view(request, *args, **kwargs):
#     subject = 'Thank you for registering to our site'
#     message = 'Body text Body text Body text Body text Body text'
#     email_from = settings.EMAIL_HOST_USER
#     recipient_list = ['',]

#     x = send_mail(
#             subject,
#             message,
#             email_from,
#             recipient_list,
#             fail_silently=False,
#         )
#     return Response({'message': x})

@api_view(['POST'])
def confirm_email_api_view(request, username, *args, **kwargs):
    """
    Confirms an email with a verification code - POST

    Required information:
        `username`: (ULR) Username of the profile to confirm
        `confirmation_key`: (Data) Key to confirm email
    
    Possible errors:
        Profile does not exist: 404, User not found
        Invalid key: 400, Confirmation key invalid
    """
    # Get user
    try:
        profile = Profile.objects.get(user__username=username)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    # Check key
    try:
        profile.user.confirm_email(request.data.get('confirmation_key'))
    except ObjectDoesNotExist:
        return Response({'message': 'Confirmation key invalid'}, status=400)

    return Response({'message': 'Email authenticated'})