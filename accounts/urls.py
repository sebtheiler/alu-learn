from django.urls import path
from . import views

urlpatterns = [
    path('stripe-config/', views.stripe_config),
    path('stripe-create-checkout-session/', views.stripe_create_checkout_session),
]
