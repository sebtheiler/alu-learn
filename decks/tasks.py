from celery import shared_task
# from .models import Deck
from profiles.models import Profile
from decks.models import StudySessionManager
import random
from celery.decorators import periodic_task
from celery.task.schedules import crontab

@shared_task
def midnight_reset(a):
    # Break the streaks of users who haven't studied today
    not_studied_profiles = Profile.objects.filter(has_done_cards_today=False)
    not_studied_profiles.update(current_streak=0)

    # Reset all users to not having studied
    Profile.objects.all().update(has_done_cards_today=False)

    # Reset the number of cards each SSM has done
    StudySessionManager.objects.all().update(new_cards_done_today=0)


@periodic_task(run_every=crontab(minute=0, hour=0))
def run_midnight_reset():
    midnight_reset.delay(random.randint(0, 10))