from django.conf import settings
from django.shortcuts import render, redirect
from django.views import generic
from django.http import JsonResponse, Http404, HttpResponse
from django.utils.http import is_safe_url

from .models import Deck, FlashCard, Tag
from .forms import DeckForm
from .serializers import DeckSerializer

ALLOWED_HOSTS = settings.ALLOWED_HOSTS

# Create your views here.
class IndexView(generic.ListView):
    template_name = 'home/index.html'
    context_object_name = 'top_decks'

    def get_queryset(self):
        return ['Deck 1', 'Deck 2', 'Deck 3']


def deck_create_view(request, *args, **kwargs):
    serializer = DeckSerializer(data=request.POST or None)
    if serializer.is_valid():
        obj = serializer.save(user=request.user)
        return JsonResponse(serializer.data, status=201)
    return JsonResponse({}, status=400)


def deck_create_view_pure_django(request, *args, **kwargs):
    user = request.user
    if not request.user.is_authenticated:
        user = None
        if request.is_ajax():
            return JsonResponse({}, status=401)
        return redirect(settings.LOGIN_URL)
    form = DeckForm(request.POST or None)
    next_url = request.POST.get("next") or None
    if form.is_valid():
        obj = form.save(commit=False)
        # Other form logic
        obj.user = request.user
        obj.save()
        if request.is_ajax():
            return JsonResponse(obj.serialize(), status=201)

        if next_url is not None and is_safe_url(next_url, ALLOWED_HOSTS):
            return redirect(next_url)
        form = DeckForm()
    if form.errors and request.is_ajax():
        return JsonResponse(form.errors, status=400)
    return render(request, 'components/form.html', context={'form': form})


def deck_list_view(request, *args, **kwargs):
    decks = Deck.objects.all()
    deck_list = [d.serialize() for d in decks]
    data = {
        'response': deck_list,
    }
    return JsonResponse(data)


def deck_detail_view(request, deck_id, *args, **kwargs):
    data = {
        "id": deck_id,
    }

    status = 200
    try:
        obj = Deck.objects.get(pk=deck_id)
        data['title'] = obj.title
    except:
        data['message'] = 'Deck not found'
        status = 404
    # return HttpResponse(f'Deck: {obj.title} - #{deck_id}')
    return JsonResponse(data, status=404)