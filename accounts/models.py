from django.contrib.auth.models import AbstractUser
from simple_email_confirmation.models import SimpleEmailConfirmationUserMixin
from django.db import models


class User(SimpleEmailConfirmationUserMixin, AbstractUser):
    password_reset_key = models.CharField(default=None, null=True, max_length=128)  # base 64
