from django.conf import settings
from django.db import models
from django.db.models.signals import post_save

import datetime

User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=220, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    birthdate = models.DateField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    pending_friends = models.ManyToManyField(User, blank=True, related_name='users_who_requested')
    total_thanks_recieved = models.IntegerField(default=0)

    longest_streak = models.PositiveSmallIntegerField(default=0)
    current_streak = models.PositiveSmallIntegerField(default=0)
    has_done_cards_today = models.BooleanField(default=False)

    def __str__(self) -> str:
        if self.user.first_name and self.user.last_name:
            return f'{self.user.first_name} {self.user.last_name} - @{self.user.username}'
        else:
            return f'@{self.user.username}'
    
    def increment_total_thanks_recieved(self):
        # Do not use this method if you need to make other changes to the profile obj
        # Only use this method if the `total_thanks_recieved` is the only attr that needs to be changed
        self.total_thanks_recieved += 1
        self.save()
        return self.total_thanks_recieved
    
    def increment_cards_done_today(self, utc_timezone_offset=None):
        # Get or create history for today
        date = datetime.datetime.now()
        if utc_timezone_offset is not None:
            date -= datetime.timedelta(minutes=utc_timezone_offset)
        history_obj, created = self.history.get_or_create(date=date.date())

        # Increment the current streak if this is the first card done today
        if created:
            self.current_streak += 1

            # Update the longest streak if the current streak is longer
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak

            # Register that the profile has studied today
            self.has_done_cards_today = True

            # Save
            self.save()

        # Increment the cards done today
        return history_obj.increment_cards_done()


class Notification(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    category = models.CharField(max_length=32, default='basic')
    title = models.CharField(max_length=128)
    description = models.TextField(default='')
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.title}: {self.description} | {self.category}'


class ProfileBadge(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='badges')
    chosen = models.BooleanField(default=False)
    identifier = models.CharField(max_length=32)

    def __str__(self) -> str:
        return f'"{self.identifier}" badge for @{self.profile.user.username}'


class ProfileHistorySegment(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='history')
    date = models.DateField(default=datetime.date.today)
    cards_done = models.PositiveSmallIntegerField(default=0)

    def __str__(self) -> str:
        return f"History for {self.profile.user.username} on {self.date}"
    
    def increment_cards_done(self):
        # Do not use this method if you need to make other changes to the profile obj
        # Only use this method if the `cards_done` is the only attr that needs to be changed
        self.cards_done += 1
        self.save()
        return self.cards_done


class ProfileSettings(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='settings')
    disable_all_tooltips = models.BooleanField(default=False)
    send_reminders = models.BooleanField(default=False)
    USER_TYPE_OPTIONS = [
        ('STUDENT', 'Student/Learner'),
        ('TEACHER', 'Teacher/Parent'),
    ]
    user_type = models.CharField(max_length=7, choices=USER_TYPE_OPTIONS, default='STUDENT')
    TIME_PER_DAY_OPTIONS = [
        ('MAX', 'As long as it takes (infinite)'),
        ('20', '20 minutes'),
        ('15', '15 minutes'),
        ('10', '10 minutes'),
        ('5', '5 minutes'),
    ]
    ideal_time_per_day = models.CharField(max_length=3, choices=TIME_PER_DAY_OPTIONS, default='MAX')
    show_update_modal = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f'Settings for {self.profile.user.username}'


# When a user is saved, create a corresponding Profile object and an initial notification
def user_did_save(sender, instance, created, *args, **kwargs):
    if created:
        profile, _ = Profile.objects.get_or_create(user=instance)
        ProfileSettings.objects.create(profile=profile)
        Notification.objects.create(
            profile=profile,
            title='Need help?',
            description="If you ever get lost or need help, you can check our [user-guide](/help/) pages."
        )

post_save.connect(user_did_save, sender=User)
