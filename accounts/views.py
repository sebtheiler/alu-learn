import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


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

    unit_amount = 300 if purchase_type == 'monthly' else 3000

    checkout_session = stripe.checkout.Session.create(
        client_reference_id=request.user.id,
        success_url=f'{settings.DOMAIN_URL}/pro/success/?session_id={{CHECKOUT_SESSION_ID}}',
        cancel_url=f'{settings.DOMAIN_URL}/pro/cancelled/',
        mode='payment',
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f'Alu Learn Pro-mode {purchase_type.capitalize()} Subscription',
                },
                'unit_amount': unit_amount,
            },
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
        # TODO: differentiate monthly/yearly subscription

        client_reference_id = event['client_reference_id']
        user = User.objects.get(pk=client_reference_id)
        user.is_pro = True
        user.save()

    return Response(status=200)
