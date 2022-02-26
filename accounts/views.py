from django.conf import settings
from django.http.response import JsonResponse

import stripe


def stripe_config(request):
    if request.method == 'GET':
        stripe_config = {'publishableKey': settings.STRIPE_PUBLISHABLE_KEY}
        return JsonResponse(stripe_config)


def stripe_create_checkout_session(request):
    if request.method == 'POST':
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            checkout_session = stripe.checkout.Session.create(
                success_url=f'{settings.DOMAIN_URL}/pro/success/?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.DOMAIN_URL}/pro/cancelled/',
                mode='payment',
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Alu Learn Pro-mode Subscription',
                        },
                    },
                }],
            )

            return JsonResponse({'sessionId': checkout_session['id']})
        except Exception as e:
            return JsonResponse({'error': str(e)})
