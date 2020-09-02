from django.shortcuts import render
from django.views.decorators.cache import cache_page, cache_control
from django.views.decorators.vary import vary_on_cookie

# Explore page
@cache_page(60*15)
def explore_home_view(request, *args, **kwargs):
    return render(request, 'explore/explore.html')

# Search for decks
def deck_search_view(request, *args, **kwargs):
    return render(request, 'explore/search-decks.html')