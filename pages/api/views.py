from django.core.mail import mail_admins
from rest_framework.decorators import api_view, permission_classes
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
        'New Contact Feedback',
        f"{title} - {description}",
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
    if settings is None:
        return Response({'message': 'You must specify the settings'}, status=400)

    request.user.profile.settings.user_type = \
        settings.get('user_type', request.user.profile.settings.user_type)
    request.user.profile.settings.ideal_time_per_day = \
        settings.get('ideal_time_per_day', request.user.profile.settings.ideal_time_per_day)
    request.user.profile.settings.send_reminders = \
        settings.get('send_reminders', request.user.profile.settings.send_reminders)
    request.user.profile.settings.is_opted_dev = \
        settings.get('is_opted_dev', request.user.profile.settings.is_opted_dev)

    request.user.profile.settings.save()
    return Response({'message': 'Updated account settings'}, status=200)


# Explore views
# TODO: rewrite these to use new shared decks
# with open('editor_deck_ids.json', 'r') as f:
#     EDITOR_PICKS_DECK_IDS = json.loads(f.read())

# with open('top_deck_ids.json', 'r') as f:
#     TOP_DECK_IDS = json.loads(f.read())


# def get_decks_from_ids(id_list, public_only=False):
#     query = Q(pk__in=id_list)
#     if public_only:
#         query &= Q(deck_type='shared') & Q(sharing_setting='PUBLIC')

#     decks_qs = SharedDeck.objects.filter(query)
#     return SharedDeckSerializer(decks_qs, many=True).data


# @cache_page(60*15)
# @api_view(['GET'])
# def api_explore_lists_view(request, *args, **kwargs):
#     """
#     Get decks to display in explore list - GET
#     """
#     data = {
#         'EDITOR': get_decks_from_ids(EDITOR_PICKS_DECK_IDS, public_only=True),
#         'TOP': get_decks_from_ids(TOP_DECK_IDS, public_only=True),
#         'HOT': [],  # get_decks_from_ids(HOT_DECK_IDS, public_only=True),
#     }

#     return Response(data, status=200)
