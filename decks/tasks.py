import json

from celery import shared_task
from celery.decorators import periodic_task
from celery.task.schedules import crontab
from django.db.models import Count
from profiles.models import Profile

from decks.models import Deck, StudySessionManager


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
    sorted_decks = Deck.objects.annotate(num_thanks=Count('thanks')).order_by('-num_thanks').filter(sharing_setting='PUBLIC')
    top_deck_ids = [deck.id for deck in sorted_decks[:5]]
    with open('top_deck_ids.json', 'w+') as f:
        f.write(json.dumps(top_deck_ids))


@periodic_task(run_every=crontab(minute=16, hour=0))
def run_midnight_reset():
    midnight_reset.delay()
