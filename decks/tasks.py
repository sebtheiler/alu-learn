from celery import shared_task
from celery.decorators import periodic_task
from celery.schedules import crontab
from django.core import mail
from django.conf import settings
from django.template.loader import render_to_string
from profiles.models import Profile


@shared_task
def midnight_reset():
    # Break the streaks of users who haven't studied today
    # not_studied_profiles = Profile.objects.filter(has_done_work_today=False)
    # not_studied_profiles.update(current_streak=0)

    # Reset all users to not having studied
    Profile.objects.update(has_done_work_today=False)


@periodic_task(run_every=crontab(minute=0, hour=4))
def run_midnight_reset():
    midnight_reset.delay()


@shared_task
def email_reminder():
    users_to_notify = Profile.objects.filter(
        has_done_work_today=False,
        current_streak__gt=0,
        settings__send_reminders=True,
    )

    connection = mail.get_connection()
    connection.open()

    for user in users_to_notify:
        streak = user.current_streak
        name = user.user.first_name

        non_html_email_client_message = f"""
Hello {name},

You're on a {streak} day streak.
Study at Alu today to make it {streak + 1}!  You got this!

Best,
Alu

(you can unsubscribe/opt-out of these reminders at Alu's setting page:\
https://www.alulearn.com/settings/)
(Sent by Alu Learn | NYC, New York)
        """

        mail.send_mail(
            f'Don\'t lose your {streak}-day streak in Alu!',
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


@periodic_task(run_every=crontab(hour=23, minute=0))  # hour=23 -> 1800 in NYC
def run_email_reminder():
    email_reminder.delay()
