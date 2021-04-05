from profiles.models import Profile
from django.db import models


class ShortUrl(models.Model):
    code = models.CharField(max_length=6, unique=True)
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
    user_agent = models.CharField(max_length=200)
    ip_address = models.CharField(max_length=45)

    def __str__(self) -> str:
        return f'URL Hit by "{self.user}" on "{self.url}"'


class QuickFeedback(models.Model):
    prompt = models.CharField(max_length=256)
    description = models.TextField()
    ANSWER_TYPE_CHOICES = [
        ('YES/NO', 'Yes or no'),
        ('SCALE_1_TO_7', 'Scale of values from 1 to 7'),
    ]
    answer_type = models.CharField(max_length=64, choices=ANSWER_TYPE_CHOICES)
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
    answer = models.CharField(max_length=256)

    def __str__(self) -> str:
        return f'Response for {self.quick_feedback.prompt} by {self.user.user.username}'
