from django.contrib.auth import get_user_model
from django.db import models
from profiles.models import Profile, ProfileSettings

User = get_user_model()


class ShortUrl(models.Model):
    code = models.CharField(max_length=8, unique=True)
    destination = models.CharField(max_length=256)

    def __str__(self) -> str:
        return f'{self.code} => {self.destination}'


class UrlHit(models.Model):
    url = models.ForeignKey(
        ShortUrl,
        on_delete=models.CASCADE,
        related_name='hits',
    )
    user = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='hits',
        null=True,
        blank=True,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=256, blank=True, null=True)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    referer = models.CharField(max_length=256, blank=True, null=True)

    def __str__(self) -> str:
        return f'URL Hit by "{self.user}" on "{self.url}"'


class QuickFeedback(models.Model):
    prompt = models.CharField(max_length=256)
    description = models.TextField()
    ANSWER_TYPE_CHOICES = [
        ('YES/NO', 'Yes or no'),
        ('SCALE_1_TO_7', 'Scale of values from 1 to 7'),
        ('RADIO_CHOICE', 'Select a single answer (must specify "answer choices")'),
        ('CHECKBOX_CHOICE', 'Select multiple answers (must specify "answer choices")'),
    ]
    answer_type = models.CharField(max_length=64, choices=ANSWER_TYPE_CHOICES)

    # Disable the question to stop it from being displayed but preserve the responses
    disabled = models.BooleanField(default=False)

    # Separate with semi-colons: Option A; Option B; Option C
    # "Other" is a special word that allows a textbox
    answer_choices = models.CharField(max_length=512, blank=True)

    REQUIREMENT_CHOICES = [
        ('NONE', 'No requirements'),
        ('STUDIED_TODAY', 'Studied today'),
        ('STUDY_PAST_WEEK', 'Studied at least once in the past week'),
        ('STUDY_TWICE_PAST_WEEK', 'Studied at least twice in the past week'),
        ('STUDY_TEN_TIMES_PAST_MONTH', 'Studied at least ten times in the past month'),
        ('IS_TEACHER', 'The user is a teacher'),
        ('IS_STUDENT', 'The user is a student'),
    ]
    requirements = models.CharField(max_length=64, choices=REQUIREMENT_CHOICES)

    def __str__(self) -> str:
        return self.prompt


class QuickFeedbackResponse(models.Model):
    quick_feedback = models.ForeignKey(
        QuickFeedback,
        on_delete=models.CASCADE,
        related_name='responses',
    )
    user = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='quick_feedback_responses',
    )
    answer = models.CharField(max_length=512)

    def __str__(self) -> str:
        return f'Response for {self.quick_feedback.prompt} by {self.user.user.username}'


class WelcomeInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    user_type = models.CharField(
        max_length=8,
        choices=ProfileSettings.USER_TYPE_OPTIONS,
        default='STUDENT',
    )
    referrer = models.CharField(max_length=8)
    join_reason = models.CharField(max_length=8)
    target_flashcards = models.PositiveSmallIntegerField()
    send_reminders = models.BooleanField()
    deck_choice = models.CharField(max_length=16)
    timezone = models.SmallIntegerField()
