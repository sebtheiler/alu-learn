from django.shortcuts import render

# Explore page
def explore_home_view(request, *args, **kwargs):
    return render(request, 'explore/explore.html')

# Search for decks
def deck_search_view(request, *args, **kwargs):
    return render(request, 'explore/search-decks.html')