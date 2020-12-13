from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated

from ..models import ContactFeedback
from rest_framework.response import Response


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
    ContactFeedback.objects.create(
        title=request.data.get('title', '<EMPTY TITLE>'),
        description=request.data.get('description', '<EMPTY DESCRIPTION>'),
        error_code=request.data.get('error_code', ''),
        urgency=request.data.get('urgency'),
        email_address=request.data.get('email', '') if not request.user.is_authenticated else request.user.email,
        contact_allowed=request.data.get('contact_allowed', False),
        is_legal_issue=request.data.get('is_legal_issue', False),
    )

    return Response({'message': 'Feedback submitted successfully'}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_settings_api_view(request, *args, **kwargs):
    """
    Update an accounts settings - POST

    Required information:
        `settings`: (Data) Object containing all settings
            `user_type`: TEACHER or STUDENT
            `ideal_time_per_day`: Time the user wants to spend studying per day
            `send_reminders`: Bool of whether to send email reminders
    """
    settings = request.data.get('settings')
    print(settings)
    if settings is None:
        return Response({'message': 'You must specify the settings'}, status=400)

    # request.user.profile.settings.disable_all_tooltips = \
    #     settings.get('disable_all_tooltips', request.user.profile.settings.disable_all_tooltips)
    request.user.profile.settings.user_type = \
        settings.get('user_type', request.user.profile.settings.user_type)
    request.user.profile.settings.ideal_time_per_day = \
        settings.get('ideal_time_per_day', request.user.profile.settings.ideal_time_per_day)
    request.user.profile.settings.send_reminders = \
        settings.get('send_reminders', request.user.profile.settings.send_reminders)

    request.user.profile.settings.save()
    return Response({'message': 'Updated account settings'}, status=200)