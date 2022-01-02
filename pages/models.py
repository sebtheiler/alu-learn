import os

from django.conf import settings
from django.core import mail
from django.db import models
from django.db.models import Sum, Q
from django.db.models.signals import post_delete
from django.template.loader import render_to_string
from profiles.models import Profile, ProfileHistorySegment


class ContactFeedback(models.Model):
    title = models.CharField(max_length=80)
    description = models.TextField(max_length=4000)
    error_code = models.CharField(max_length=8, null=True)
    contact_allowed = models.BooleanField(default=False)
    email_address = models.EmailField(max_length=64)
    urgency = models.PositiveSmallIntegerField(null=True)
    is_legal_issue = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-urgency',)

    def __str__(self) -> str:
        return ('(LEGAL): ' if self.is_legal_issue else 'Feedback: ') + self.title


class UploadedImage(models.Model):
    flashcard_data = models.ForeignKey(
        'decks.FlashCardData',
        on_delete=models.CASCADE,
        related_name='images',
        null=True, blank=True,
    )

    image = models.ImageField(upload_to='uploads/')
    description = models.CharField(max_length=512, null=True, blank=True, default='')
    original_url = models.URLField(null=True, blank=True)

    field_number = models.PositiveSmallIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('field_number',)

    def __str__(self) -> str:
        return self.image.name


# Send the Year's Summary
def send_years_summary(send: bool = False):
    total_flashcards = list(
        ProfileHistorySegment.objects.aggregate(Sum('cards_done')).values()
    )[0]
    total_milliseconds = list(
        ProfileHistorySegment.objects.aggregate(Sum('time_spent')).values()
    )[0]
    profiles = Profile.objects.annotate(
        total_cards=Sum('history__cards_done'),
        total_time=Sum('history__time_spent'),
    ).filter(
        Q(total_cards__gte=100) & ~Q(settings__user_type='TEACHER'),
    ).order_by('-total_cards')

    connection = mail.get_connection()
    connection.open()

    print(total_flashcards, total_milliseconds, profiles.count())
    for i, profile in enumerate(profiles):
        context = {
            'name': profile.user.first_name.strip().capitalize(),
            'flashcards_studied': profile.total_cards,
            'time_spent': round(profile.total_time/1000/60/60*10)/10,
            'longest_streak': profile.longest_streak,
            'rank': i + 1,
            'percent': round(profile.total_cards/total_flashcards * 1000)/10,
        }
        print(context)

        if send:
            mail.send_mail(
                'Your Alu New Year\'s Summary',
                'Please use an HTML-capable browser to view this summary',
                settings.EMAIL_HOST_USER,
                [profile.user.email],
                html_message=render_to_string(
                    'emails/new-years-summary.html',
                    context,
                ),
                fail_silently=False,
                connection=connection,
            )

    connection.close()


# Deletes file from filesystem when corresponding `UploadedImage` object is deleted
# Adapted from https://stackoverflow.com/a/16041527/10226703
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if os.path.isfile(instance.image.path):
        os.remove(instance.image.path)


post_delete.connect(auto_delete_file_on_delete, sender=UploadedImage)
