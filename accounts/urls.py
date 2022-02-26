from django.urls import path
from utils import render_basic_view
from . import views

urlpatterns = [
    path('pro/', render_basic_view('accounts/pro-upgrade.html')),
    path('api/accounts/stripe-config/', views.stripe_config),
    path('api/accounts/stripe-create-checkout-session/', views.stripe_create_checkout_session),
]
