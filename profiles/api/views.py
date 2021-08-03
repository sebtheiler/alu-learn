import datetime

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from simple_email_confirmation.models import EmailAddress
from utils import get_paginated_queryset_response

from ..models import Notification, Profile
from ..serializers import (MinifiedProfileSerializer, NotificationSerializer,
                           PublicProfileSerializer)

User = get_user_model()


@api_view(['GET'])
def profile_detail_api_view(request, username, *args, **kwargs):
    """
    Get detail about a profile with username `username` - GET

    Required information:
        `username`: (URL) Username of the profile to get detail about
    """
    # Find the user in question
    # TODO: "hacker" could get people's emails with this
    try:
        profile = Profile.objects.get(user__username=username)

        return Response(PublicProfileSerializer(
            profile,
            context={'request': request},
        ).data, status=200)
    except Profile.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_toggle_api_view(request, recipient_username, *args, **kwargs):
    """
    Adds or removes a friend - POST

    `recipient_username`: The username of the user who launched the friend request
    `action`: (Data) 'friend' | 'unfriend'
    """
    # Find the user in question
    try:
        recipient = Profile.objects.get(
            user__username=recipient_username.lower()
        )  # type: Profile
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    # Get action
    action = request.data.get('action')
    if action is None:
        return Response({'message': 'You must specify an action'})

    # Friending logic
    message = recipient.toggle_friend(request.user, action)
    if message:
        return Response({'message': message}, status=400)

    return Response(
        PublicProfileSerializer(
            recipient,
            context={'request': request},
        ).data,
        status=200,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_request_api_view(request, recipient_username, *args, **kwargs):
    """
    Send a friend request to a user with username `recipient_username`

    Required information:
        `recipient_username`: (URL) Username of the user to send a friend request to
    """
    try:
        recipient_profile = Profile.objects.get(
            user__username=recipient_username.lower()
        )
    except Profile.DoesNotExist:
        return Response({'message': f'User "{recipient_username}" not found'}, status=404)

    message = recipient_profile.request_friend(request.user)
    if message:
        return Response({'message': message}, status=400)

    return Response({'message': 'Request sent succesfully'}, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_api_view(request, *args, **kwargs):
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
    if request.method == 'POST':
        # Create notification object
        notif = Notification.objects.create(
            profile=request.user.profile,
            title=request.data.get('title'),
            description=request.data.get('description'),
            category=request.data.get('category'),
        )
        return Response(NotificationSerializer(instance=notif).data, status=201)
    elif request.method == 'GET':
        # List all notifications
        notif_qs = Notification.objects.filter(profile__user=request.user).order_by('-timestamp')

        return get_paginated_queryset_response(
            notif_qs,
            request,
            NotificationSerializer,
            page_size=3,
            other_information={'total_unread': notif_qs.filter(read=False).count()},
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_read_api_view(request, *args, **kwargs):
    """
    Get unread notifications for a user, or mark notifications as read - GET/POST

    To get list of notifications, use request method GET

    To mark a notification as read,
        Use request method POST
        Request data must have attributes:
            `notification_id` (this can also be a list of multiple notifications)
    """
    if request.method == 'POST':
        notification_id = request.data.get('notification_id')
        if isinstance(notification_id, int):
            # Get notification
            try:
                notif = Notification.objects.get(profile__user=request.user, pk=notification_id)
            except Notification.DoesNotExist:
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
            return Response({'message': 'Please specify (a) notification ID(s)'}, status=400)
    elif request.method == 'GET':
        # List all unread notifications
        return Response(NotificationSerializer(
            Notification.objects.filter(profile__user=request.user, read=False),
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
    username = request.GET.get('username')
    email = request.GET.get('email')
    if None in (username, email):
        return Response({'message': 'Please specify username and email'}, status=400)

    username_is_available = not User.objects.filter(username=username.lower()).exists()
    email_is_available = not User.objects.filter(email=email.lower()).exists()

    return Response({
        'username_is_available': username_is_available,
        'email_is_available': email_is_available,
    }, status=200)


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
    """
    # Get data
    birthdate = request.data.get('birthdate')
    last_name = request.data.get('last_name')
    first_name = request.data.get('first_name')
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if None in (birthdate, last_name, first_name, username, email, password):
        return Response({'message': 'Not all parameters were specified'}, status=400)

    username = username.lower().replace('@', '').replace('$', '').replace('#', '')

    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    birthdate = datetime.date(
        year=birthdate.get('year'),
        month=months.index(birthdate.get('month').lower()) + 1,
        day=birthdate.get('day'),
    )
    # Check that the email is in the list of allowed emails or ends with @westendsecondary.com
    if email not in settings.ALLOWED_EMAILS and email[-21:] != '@westendsecondary.com':
        return Response({'message': 'Email not allowed'}, status=400)

    # Check email and username available
    try:
        Profile.objects.get(user__username=username)
        return Response({'message': 'Username taken'})
    except Profile.DoesNotExist:
        try:
            Profile.objects.get(user__email=email)
            return Response({'message': 'Email taken'})
        except Profile.DoesNotExist:
            pass

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

    # Send confirmation email
    subject = 'Welcome to Alu!'
    message = f"""
We're glad you signed up!

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
    """
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
def change_email(request, *args, **kwargs):
    """
    Goes through the process of changing emails - POST

    Required information:
        `password`: (Data) Password of the user for security reasons
        `new_email`: (Data) Email to set the user's new email to

    Possible errors:
        Password invalid: 401, Invalid credentials
    """
    password = request.data.get('password')
    new_email = request.data.get('new_email')
    user = authenticate(username=request.user.username, password=password)
    if user is None:
        return Response({'message': 'Invalid credentials'}, status=401)
    if new_email is None:
        return Response({'message': 'You must provide a new email'})
    else:
        confirmation_key = user.add_unconfirmed_email(new_email)

        # Send confirmation email
        subject = 'Change Email'
        message = f"""
Look's like you want to change your email.
Here's a confirmation code, to make sure this email is really you: {confirmation_key}
If this wasn't you, you can ignore this message, but please be aware someone may know your email.
        """
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [new_email]

        send_mail(
            subject,
            message,
            email_from,
            recipient_list,
            fail_silently=False,
        )

        return redirect('/confirm-email/')


@api_view(['POST'])
def change_password(request, *args, **kwargs):
    """
    Changes a user's password - POST

    Required information:
        `new_password`: (Data) Password to be changed to

        If the user is not authenticated, you must supply:
            `email`: (Data) Username of the profile to change
            `reset_key`: (Data) Key for password reset
        otherwise:
            `old_password`: (Data) The user's current password

    Possible errors:
        Old password invalid: 401, Invalid credentials
    """
    if not request.user.is_authenticated:
        # If the user is resetting their password,
        # confirm that the key they supplied was valid
        email = request.data.get('email')
        reset_key = request.data.get('reset_key')
        new_password = request.data.get('new_password')

        # Get user
        try:
            profile = Profile.objects.get(user__email__iexact=email)
        except Profile.DoesNotExist:
            return Response({'message': 'Email not found'}, status=404)

        # Check key valid
        if reset_key and reset_key != profile.user.password_reset_key:
            return Response({'message': 'Invalid reset key'}, status=401)

        # Update password
        profile.user.set_password(new_password)
        profile.user.save()

        # Invalidate key
        profile.user.password_reset_key = None
        profile.user.save()

        return redirect('/login/')
    else:
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
            return Response(
                {'message': 'You must specify `old_password` and `new_password`'},
                status=400,
            )


@api_view(['POST'])
def password_reset_email_api_view(request, email, *args, **kwargs):
    """
    Sends a reset password email and generates a secure code - POST

    Possible errors:
        Invalid username: 404, User not found
    """
    try:
        profile = Profile.objects.get(user__email=email)
    except Profile.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    # Generate impossible to guess, one-time-password
    allowed_chars = 'bcdfghjkmpqrtvwxyBCDFGHJKMPQRTVWXY346789-_'
    password = get_random_string(128, allowed_chars)

    # Update the user's profile with the one-time-password
    profile.user.password_reset_key = password
    profile.user.save()

    # Send an email with a link including the one-time-password
    # Send confirmation email
    link = \
        f'https://www.alulearn.com/reset-password/confirm/?k={password}&email={profile.user.email}'
    subject = 'Alu Password Reset'
    message = f"""
Looks like you forgot your password.

Click this link to reset your password: {link}
If this wasn't you, you can safely ignore this email, but be aware someone may know your email.

(if you need it, your username is: {profile.user.username})

Best,
Alu
    """
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [profile.user.email]

    send_mail(
        subject,
        message,
        email_from,
        recipient_list,
        fail_silently=False,
    )
    return Response({'message': 'Sent reset email'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_friends_api_view(request, *args, **kwargs):
    """
    Gets a user's friends - GET

    Possible errors:
        Invalid username: 404, User not found
    """
    return Response(
        MinifiedProfileSerializer(
            request.user.profile.friends,
            many=True,
        ).data,
        status=200,
    )


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
    except Profile.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    # Check key
    try:
        email = profile.user.confirm_email(request.data.get('confirmation_key').replace(' ', ''))

        if email:
            profile.user.email = email
            profile.user.set_primary_email(email)
            profile.user.save()
    except (Profile.DoesNotExist, EmailAddress.DoesNotExist):
        return Response({'message': 'Confirmation key invalid'}, status=400)

    return Response({'message': 'Email authenticated'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def read_changelog_popup_api_view(request, *args, **kwargs):
    """
    Marks the changelog popup as read - POST
    """
    settings = request.user.profile.settings
    settings.show_update_modal = False
    settings.save()

    return Response({'message': 'Marked popup as read'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_force_login(request, *args, **kwargs):
    """
    Allows a staff to login to another user's account for emergency support reasons - POST
    You can't use this if you aren't a staff, so don't bother trying

    Required information:
        `username`: (Data) Username of the account to login to
    """
    if not request.user.is_staff:
        return Response({'message': 'No'}, status=420)

    username = request.data.get('username').lower()
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)
    login(request, user)

    return Response({'message': 'You\'re in'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def streak_review_info(request, *args, **kwargs):
    """
    Get basic streak and review information about the current user - GET

    `utc_timezone_offset`? (GET): UTC timezone offset in minutes
    """
    return Response({
        'streak': request.user.profile.current_streak,
        'cards_done': request.user.profile.get_create_history(
            create=False,
            utc_timezone_offset=request.GET.get('utc_timezone_offset'),
        )[0] or 0,
        'target_cards_done': 100,  # TODO: make this customizable
    }, status=200)
