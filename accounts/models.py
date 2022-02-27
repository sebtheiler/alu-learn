from django.contrib.auth.models import AbstractUser
from simple_email_confirmation.models import SimpleEmailConfirmationUserMixin
from django.db import models


class User(SimpleEmailConfirmationUserMixin, AbstractUser):
    password_reset_key = models.CharField(default=None, null=True, max_length=128)  # base 64

    is_pro = models.BooleanField(default=False)
    pro_from_org = models.BooleanField(default=False)


class StripeCustomer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.user.username
