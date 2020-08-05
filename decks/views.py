from django.shortcuts import render
from django.views import generic


def decks_list_view(request, *args, **kwargs):
    return render(request, 'decks/list.html')


def decks_detail_view(request, deck_id, *args, **kwargs):
    return render(request, 'decks/detail.html', context={'deck_id': deck_id})


def decks_profile_view(request, username, *args, **kwargs):
    return render(request, 'decks/profile.html', context={'profile_username': username})
