import json

from celery import shared_task
from celery.decorators import periodic_task
from celery.schedules import crontab
from django.core import mail
from django.conf import settings
from django.template.loader import render_to_string
from django.db.models import Count
from profiles.models import Profile

from decks.models import SharedDeck, StudySessionManager


@shared_task
def midnight_reset():
    # Break the streaks of users who haven't studied today
    not_studied_profiles = Profile.objects.filter(has_done_cards_today=False)
    not_studied_profiles.update(current_streak=0)

    # Reset all users to not having studied
    Profile.objects.all().update(has_done_cards_today=False)

    # Reset the number of cards each SSM has done
    StudySessionManager.objects.all().update(new_cards_done_today=0)

    # Calculate top deck Ids
    # sorted_decks = SharedDeck.objects.annotate(num_thanks=Count('thanks')).order_by('-num_thanks')
    sorted_decks = SharedDeck.objects.annotate(num_clones=Count('clones')).order_by('-num_clones')
    top_deck_ids = [deck.id for deck in sorted_decks[:5]]
    with open('top_deck_ids.json', 'w+') as f:
        f.write(json.dumps(top_deck_ids))


@periodic_task(run_every=crontab(minute=0, hour=4))
def run_midnight_reset():
    midnight_reset.delay()


@shared_task
def email_reminder():
    users_to_notify = Profile.objects.filter(
        has_done_cards_today=False,
        current_streak__gt=0,
        settings__send_reminders=True,
    )

    connection = mail.get_connection()
    connection.open()

    for user in users_to_notify:
        streak = user.current_streak
        name = user.user.first_name

        plain_message = f"""
Hello {name},

Improving requires practice every day.
Study at Alu today, or you'll lose your {streak}-day streak!

Best,
Alu

(you can unsubscribe/opt-out of these reminders at Alu's setting page: https://www.alulearn.com/settings/)
(Sent by Alu Learn | NYC, New York)
        """ # only sent in non-HTML email clients

        mail.send_mail(
            f'Don\'t lose your {streak}-day streak in Alu!',
            plain_message,
            settings.EMAIL_HOST_USER,
            [user.user.email],
            html_message=render_to_string('emails/reminder.html', {'name': name, 'streak': streak}), # FIND SOLUTION FOR THIS
            fail_silently=False,
            connection=connection,
        )

    connection.close()


@periodic_task(run_every=crontab(minute=43, hour=2)) # hour=23 -> 1800 in NYC
def run_email_reminder():
    email_reminder.delay()
