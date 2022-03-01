import datetime as dt
import os

from celery import shared_task
from celery.decorators import periodic_task
from celery.schedules import crontab
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.template.loader import render_to_string
from django.utils import timezone
from profiles.models import Profile

User = get_user_model()

every_hour = ','.join(str(i) for i in range(24))  # 0,1,2,3,...,23


# === Reset streaks and send reminder emails for every timezone ===
def reset_streaks(midnight_for):
    # Break the streaks of users in the TZ who haven't studied today
    not_studied_profiles = Profile.objects.filter(
        has_done_work_today=False,
        streak_freeze_expires__lt=timezone.now(),
        settings__timezone=midnight_for,
    )
    not_studied_profiles.update(current_streak=0)

    # Reset all users in TZ to not having studied
    Profile.objects.filter(
        settings__timezone=midnight_for,
    ).update(
        has_done_work_today=False,
    )


def send_email_reminders(email_for):
    users_to_notify = Profile.objects.filter(
        has_done_work_today=False,
        current_streak__gt=0,
        settings__send_reminders=True,
        streak_freeze_expires__lt=timezone.now(),
        settings__timezone=email_for,
    )

    connection = mail.get_connection()
    connection.open()

    for user in users_to_notify:
        streak = user.current_streak
        name = user.user.first_name

        non_html_email_client_message = f"""
Hi {name},

You're on a {streak} day streak.
Study at Alu today to make it {streak + 1}!  You got this!

Best,
Alu

(you can unsubscribe/opt-out of these reminders at Alu's setting page:\
https://www.alulearn.com/settings/)
(Sent by Alu Learn | NYC, New York)
        """

        mail.send_mail(
            f'Get a {streak + 1}-day streak in Alu!',
            non_html_email_client_message,
            settings.EMAIL_HOST_USER,
            [user.user.email],
            html_message=render_to_string(
                'emails/reminder.html',
                {'name': name, 'streak': streak},
            ),
            fail_silently=False,
            connection=connection,
        )

    connection.close()


@shared_task
def tz_hourly():
    utc_hour = dt.datetime.utcnow().hour
    midnight_for = (utc_hour - 24)*60
    email_for = (utc_hour - 18)*60

    reset_streaks(midnight_for)
    send_email_reminders(email_for)


@periodic_task(run_every=crontab(minute=0, hour=every_hour))
def run_tz_hourly():
    tz_hourly.delay()


# === Backup the server at UTC midnight ===
@shared_task
def backup_server():
    filepath = f'{settings.DB_BACKUP_DIR}/{dt.datetime.utcnow().strftime("%Y-%m-%d")}.sql'
    os.system(f'pg_dump alu > "{filepath}"')


@shared_task
def expire_pro_mode_trial():
    users = User.objects.filter(
        pro_trial_expires__lte=timezone.now(),
    )

    connection = mail.get_connection()
    connection.open()
    for user in users:
        context = {
            'name': user.first_name,
        }

        mail.send_mail(
            'Your Free Trial of Alu Pro Has Expired',
            'Please use an HTML-capable browser to view this summary',
            settings.EMAIL_HOST_USER,
            [user.email],
            html_message=render_to_string(
                'emails/pro-mode-expired.html',
                context,
            ),
            fail_silently=False,
            connection=connection,
        )

    users.update(
        is_pro=False,
        pro_trial_expires=None,
    )


@periodic_task(run_every=crontab(minute=0, hour=0))
def run_backup_server():
    backup_server.delay()
    expire_pro_mode_trial.delay()
