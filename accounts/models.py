from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.db import models
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string


class User(AbstractUser):
    password_reset_key = models.CharField(default=None, null=True, max_length=128)

    is_pro = models.BooleanField(default=False)
    is_pro_from_org = models.BooleanField(default=False)
    pro_trial_expires = models.DateTimeField(null=True, blank=True)

    created_with_google = models.BooleanField(default=False)

    confirmation_key = models.CharField(max_length=8, null=True)
    is_confirmed = models.BooleanField(default=False)

    def signup_email_confirmation(self):
        self.confirmation_key = get_random_string(length=8, allowed_chars=settings.ALLOWED_CHARS)
        self.save(update_fields=('confirmation_key',))

        send_mail(
            f'Welcome to Alu! - Confirm Your Email!',
            'You must use an HTML-enabled browser to view this email',
            settings.EMAIL_HOST_USER,
            [self.email],
            html_message=render_to_string(
                'emails/confirm-email.html',
                {'name': self.first_name, 'confirmation_key': self.confirmation_key},
            ),
            fail_silently=False,
        )

    def confirm_email(self, confirmation_key: str) -> bool:
        if self.confirmation_key == confirmation_key and self.confirmation_key is not None:
            self.is_confirmed = True
            self.confirmation_key = None
            self.save(update_fields=('is_confirmed', 'confirmation_key'))

            return True

        return False


class StripeCustomer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_subscription_id = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.user.username
