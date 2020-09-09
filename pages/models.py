from django.db import models

class ContactFeedback(models.Model):
    title = models.CharField(max_length=80)
    description = models.TextField(max_length=4000)
    error_code = models.CharField(max_length=8)
    contact_allowed = models.BooleanField(default=False)
    email_address = models.EmailField(max_length=64)
    urgency = models.PositiveSmallIntegerField(null=True)

    class Meta:
        ordering = ('-urgency',)

    def __str__(self):
        return f'Feedback: {self.title}'