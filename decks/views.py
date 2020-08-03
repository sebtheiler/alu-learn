from django.conf import settings
from django.shortcuts import render, redirect
from django.views import generic
from django.http import JsonResponse, Http404, HttpResponse
from django.utils.http import is_safe_url
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .models import Deck, FlashCard, Tag
from .forms import DeckForm
from .serializers import DeckSerializer

ALLOWED_HOSTS = settings.ALLOWED_HOSTS

# Create your views here.
class IndexView(generic.ListView):
    template_name = 'decks/index.html'
    context_object_name = 'top_decks'

    def get_queryset(self):
        return ['Deck 1', 'Deck 2', 'Deck 3']


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_create_view(request, *args, **kwargs):
    serializer = DeckSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response({}, status=400)


@api_view(['GET'])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
def deck_list_view(request, *args, **kwargs):
    decks_qs = Deck.objects.all()
    username = request.GET.get('username')
    if username is not None: # theoretically shows every deck to anon user
        decks_qs = decks_qs.filter(user__username__iexact=username)
    serializer = DeckSerializer(decks_qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
def deck_detail_view(request, deck_id, *args, **kwargs):
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({}, status=404)
    obj = decks_qs.first()
    serializer = DeckSerializer(decks_qs, many=True)
    return Response(serializer.data[0])


@api_view(['DELETE', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def deck_delete_view(request, deck_id, *args, **kwargs):
    decks_qs = Deck.objects.filter(pk=deck_id)
    if not decks_qs.exists():
        return Response({}, status=404)
    decks_qs = decks_qs.filter(user=request.user)
    if not decks_qs.exists():
        return Response({'message': 'You are not authorized to delete this deck.'}, 401)
    obj = decks_qs.first()
    obj.delete()
    return Response({'message': 'Deck deleted succesfully'}, status=200)


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


def deck_list_view_pure_django(request, *args, **kwargs):
    decks = Deck.objects.all()
    deck_list = [d.serialize() for d in decks]
    data = {
        'response': deck_list,
    }
    return JsonResponse(data)


def deck_detail_view_pure_django(request, deck_id, *args, **kwargs):
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