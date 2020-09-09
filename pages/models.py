from django.db import models

class ContactFeedback(models.Model):
    title = models.CharField(max_length=80)
    description = models.TextField(max_length=4000)
    error_code = models.CharField(max_length=8, null=True)
    contact_allowed = models.BooleanField(default=False)
    email_address = models.EmailField(max_length=64)
    urgency = models.PositiveSmallIntegerField(null=True)
    is_legal_issue = models.BooleanField(default=False)

    class Meta:
        ordering = ('-urgency',)

    def __str__(self):
        return ('(LEGAL): ' if self.is_legal_issue else 'Feedback: ') + self.title