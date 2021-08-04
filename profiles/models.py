from __future__ import annotations
import datetime
from typing import Literal, Tuple, Union

from django.conf import settings
from django.db import models
from django.db.models.query import QuerySet
from django.db.models.signals import post_save

User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=220, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    birthdate = models.DateField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    pending_friends = models.ManyToManyField(
        User,
        blank=True,
        related_name='users_who_requested',
    )

    longest_streak = models.PositiveSmallIntegerField(default=0)
    current_streak = models.PositiveSmallIntegerField(default=0)
    has_done_work_today = models.BooleanField(default=False)

    def __str__(self) -> str:
        if self.user.first_name and self.user.last_name:
            return f'{self.user.first_name} {self.user.last_name} - @{self.user.username}'
        else:
            return f'@{self.user.username}'

    def increment_work_done_today(
        self,
        cards_done: int = 0,
        utc_timezone_offset: int = None,  # in mins
        time_taken: int = 0,
        habits_done: int = 0,
    ) -> int:
        # Get or create history for today
        history_obj, created = self.get_create_history(utc_timezone_offset=utc_timezone_offset)

        # Increment the current streak if this is the first card done today
        if created:
            self.current_streak += 1
            self.has_done_work_today = True
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak

            self.save()

        # Increment the cards done today
        return history_obj.increment_work_done(
            cards_done,
            time_taken,
            habits_done,
        )

    def get_create_history(
        self,
        create: bool = True,
        utc_timezone_offset: int = None,  # in mins
    ) -> Tuple[Union[ProfileHistorySegment, None], bool]:
        date = datetime.datetime.now()
        if utc_timezone_offset is not None:
            date -= datetime.timedelta(minutes=max(min(int(utc_timezone_offset), 1440), 0))

        date = date.date()

        if create:
            return self.history.get_or_create(date=date)
        else:
            try:
                return self.history.get(date=date), False
            except ProfileHistorySegment.DoesNotExist:
                return None, False

    def toggle_friend(
        self,
        requesting_user: User,
        action: Literal['friend', 'unfriend'],
    ):
        if action == 'friend':
            if self.user == requesting_user:
                return 'You cannot friend yourself'

            if requesting_user not in self.friends.all():
                recipient_is_pending = self.user in requesting_user.profile.pending_friends.all()
                if recipient_is_pending:
                    # Add eachother as friends
                    self.friends.add(requesting_user)
                    requesting_user.profile.friends.add(self.user)

                    # Remove the user as a pending friend
                    requesting_user.profile.pending_friends.remove(self.user)
                else:
                    return 'You cannot friend a user who has not requested to be your friend'
            else:
                return 'You are already friends with this user'
        elif action == 'unfriend':
            if requesting_user in self.friends.all():
                # Remove eachother as friends
                self.friends.remove(requesting_user)
                requesting_user.profile.friends.remove(self.user)
            else:
                return 'You cannot unfriend a user who is not your friend'
        else:
            return 'Unknown action'

    def request_friend(
        self,
        sending_user: User,
    ):
        if sending_user == self.user:
            return 'You cannot friend yourself'

        # Check if the users are already pending eachother
        if sending_user in self.pending_friends.all():
            return 'You have already sent a friend request to this user'
        elif self.user in sending_user.profile.pending_friends.all():
            # If the recipient user has already requested the sending user,
            # directly add them as friends
            self.friends.add(sending_user)
            sending_user.profile.friends.add(self.user)
            sending_user.profile.pending_friends.remove(self.user)

            return

        # Put user in the profile's pending friends
        self.pending_friends.add(sending_user)
        self.save()

        # Create notification
        first_name = sending_user.first_name or 'Someone'
        title = f'{first_name} wants to be your friend!'
        if sending_user.first_name:
            if sending_user.last_name:
                description = f'{sending_user.first_name} {sending_user.last_name}'
            else:
                description = f'{sending_user.first_name}'
            description += ' '
        else:
            description = ''
        description += f'[@{sending_user.username}](/profiles/u/{sending_user.username}) wants to be your friend'

        Notification.objects.create(
            profile=self,
            category='friend_request',
            title=title,
            description=description,
        )


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


class ProfileHistorySegmentModelManager(models.Manager):
    def get_queryset(self) -> QuerySet:
        return super().get_queryset().prefetch_related('profile')


class ProfileHistorySegment(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='history',
    )
    date = models.DateField(default=datetime.date.today)
    cards_done = models.PositiveSmallIntegerField(default=0)
    time_spent = models.PositiveIntegerField(default=0)
    habits_done = models.PositiveSmallIntegerField(default=0)

    objects = ProfileHistorySegmentModelManager()

    def __str__(self) -> str:
        return f'History for {self.profile.user.username} on {self.date}'

    def increment_work_done(
        self,
        cards_done: int = 0,
        time_taken: int = 0,  # in ms
        habits_done: int = 0,
    ) -> int:
        # Do not use this method if you need to make other changes to the profile obj
        # Only use this method if the `cards_done` is the only attr that needs to be changed
        self.cards_done += cards_done
        self.time_spent += time_taken
        self.habits_done += habits_done

        self.save()
        return self.cards_done


class ProfileSettings(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='settings')
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
    ideal_time_per_day = models.CharField(
        max_length=3,
        choices=TIME_PER_DAY_OPTIONS,
        default='MAX',
    )
    is_opted_dev = models.BooleanField(default=False)
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
