from django.urls import path
from utils import render_basic_view
from . import views

urlpatterns = [
    path('pro/', render_basic_view('accounts/pro-upgrade.html', False, False)),
    path('pro/success/', render_basic_view('accounts/pro-success.html')),
    path('pro/cancelled/', render_basic_view('accounts/pro-cancelled.html')),
    path('api/accounts/stripe-config/', views.stripe_config),
    path('api/accounts/stripe-create-checkout-session/', views.stripe_create_checkout_session),
    path('api/accounts/stripe-get-subscription/', views.stripe_get_subscription),
    path('api/accounts/stripe-cancel-subscription/', views.stripe_cancel_subscription),
    path('api/accounts/stripe-reactivate-subscription/', views.stripe_reactivate_subscription),
    path('api/accounts/stripe-webhook/', views.stripe_webhook),
]
