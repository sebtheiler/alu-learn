from django.shortcuts import render
from django.views import generic


# Render the home-page feed view
def decks_feed_view(request, *args, **kwargs):
    return render(request, 'pages/feed.html', status=200)


# Render a global list of decks (unused, should probably be removed)
def decks_list_view(request, *args, **kwargs):
    return render(request, 'decks/list.html')


# Renders information on a specific deck
def decks_detail_view(request, deck_id, *args, **kwargs):
    return render(request, 'decks/detail.html', context={'deck_id': deck_id})
