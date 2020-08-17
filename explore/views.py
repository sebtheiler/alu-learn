from django.shortcuts import render

def explore_home_view(request, *args, **kwargs):
    return render(request, 'explore/explore.html')