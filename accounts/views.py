import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StripeCustomer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_config(request):
    stripe_config = {'publishableKey': settings.STRIPE_PUBLISHABLE_KEY}
    return Response(stripe_config)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stripe_create_checkout_session(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY

    purchase_type = request.data.get('purchaseType')
    if purchase_type not in ('monthly', 'yearly'):
        return Response({'error': 'Invalid purchase type'}, status=400)

    price_id = (
        settings.STRIPE_MONTHLY_PRO_ID
        if purchase_type == 'monthly' else
        settings.STRIPE_YEARLY_PRO_ID
    )

    checkout_session = stripe.checkout.Session.create(
        client_reference_id=request.user.id,
        success_url=f'{settings.DOMAIN_URL}/pro/success/?session_id={{CHECKOUT_SESSION_ID}}',
        cancel_url=f'{settings.DOMAIN_URL}/pro/cancelled/',
        mode='subscription',
        payment_method_types=['card'],
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
    )

    return Response({'sessionId': checkout_session['id']})


@api_view(['POST'])
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_ENDPOINT_SECRET
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret,
        )
    except ValueError:
        # Invalid payload
        return Response(status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return Response(status=400)

    # Handle checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        client_reference_id = session['client_reference_id']
        stripe_customer_id = session['customer']
        stripe_subscription_id = session['subscription']

        user = User.objects.get(pk=client_reference_id)
        user.is_pro = True
        user.save()

        StripeCustomer.objects.create(
            user=user,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
        )

    return Response(status=200)
