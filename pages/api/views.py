from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated

from ..models import ContactFeedback
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
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