import base64

import requests
from django.conf import settings
from django.core.cache import cache
from django.core.mail import mail_admins
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from alu.slack_app import post_slack_message
from sharing_system.models import SharedDeck
from sharing_system.serializers import SharedDeckSerializer

from ..models import ContactFeedback


@api_view(['POST'])
def contact_us_api_view(request, *args, **kwargs):
    """
    Gives feedback - POST

    Required information:
        `title`: (Data) Title/short desc. of the post
        `description`: (Data) Long desc. of the post
        `error_code`: (Data) Error code (optional)
        `urgency`: (Data) How urgent is this issue? (optional)
        `email`: (Data) Email of the user (optional)
        `contact_allowed`: (Data) Allow us to contact you? (default=False)
        `is_legal_issue`: (Data) Is this a legal issue?
    """
    title = request.data.get('title', '<EMPTY TITLE>')
    description = request.data.get('description', '<EMPTY DESCRIPTION>')

    ContactFeedback.objects.create(
        title=title,
        description=description,
        error_code=request.data.get('error_code', ''),
        urgency=request.data.get('urgency'),
        email_address=(
            request.data.get('email', '')
            if not request.user.is_authenticated
            else request.user.email
        ),
        contact_allowed=request.data.get('contact_allowed', False),
        is_legal_issue=request.data.get('is_legal_issue', False),
    )

    mail_admins(
        f'New Contact Feedback - {title}',
        f"{description}",
    )
    post_slack_message(f'*New Contact Feedback:* {title}')

    return Response({'message': 'Feedback submitted successfully'}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_settings_api_view(request, *args, **kwargs):
    """
    Update an accounts settings - POST

    Required information:
        `settings`: (Data) Object containing all settings
            `user_type`: TEACHER or STUDENT
            `target_num_cards`: The goal number of cards the student wants to do
            `send_reminders`: Bool of whether to send email reminders
            `timezone`: Integer of timezone offset (GMT-5=300)
    """
    settings = request.data.get('settings')
    if settings is None:
        return Response({'message': 'You must specify the settings'}, status=400)

    request.user.profile.settings.user_type = \
        settings.get('user_type', request.user.profile.settings.user_type)
    request.user.profile.settings.target_num_cards = \
        settings.get('target_num_cards', request.user.profile.settings.target_num_cards)
    request.user.profile.settings.send_reminders = \
        settings.get('send_reminders', request.user.profile.settings.send_reminders)
    request.user.profile.settings.is_opted_dev = \
        settings.get('is_opted_dev', request.user.profile.settings.is_opted_dev)
    request.user.profile.settings.timezone = \
        settings.get('timezone', request.user.profile.settings.timezone)
    request.user.profile.settings.send_marketing_research = \
        settings.get(
            'send_marketing_research',
            request.user.profile.settings.send_marketing_research,
        )

    request.user.profile.settings.save()
    return Response({'message': 'Updated account settings'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_image_with_proxy(request, *args, **kwargs):
    url = request.GET.get('url')
    if not url or len(url) > 150:
        return Response({'message': '`url` invalid'}, status=400)

    cache_key = f'IMAGEPROXY__{url[:200]}'
    uri = cache.get(cache_key)
    if not uri:
        # Get response
        try:
            response = requests.get(url, headers=settings.USER_AGENT_HEADERS)
            ok = response.ok
        except Exception:
            response = None
            ok = False

        # Check that response is valid
        content_type = response.headers['Content-Type'] if response else ''
        if not ok or not content_type.startswith('image/'):
            return Response(
                {'message': 'Problem getting response'},
                status=400,
            )

        # Construct base64 URI
        uri = f'data:{content_type};base64,{base64.b64encode(response.content).decode("utf8")}'
        cache.set(cache_key, uri, 86400)  # cache for a day

    return Response(uri, status=200)


# Explore views
@api_view(['GET'])
@cache_page(60*60*24)
def api_explore_lists_view(request, *args, **kwargs):
    """
    Get decks to display in explore list - GET
    """
    shared_decks = SharedDeckSerializer(
        SharedDeck.bulk_annotate_with_num_copies(
            SharedDeck.objects.filter(view_access='PUBLIC'),
        ).order_by('-num_copies')[:10],
        many=True,
    ).data
    data = {
        'EDITOR': shared_decks,
        'TOP': [],
        'HOT': [],
    }

    return Response(data, status=200)
