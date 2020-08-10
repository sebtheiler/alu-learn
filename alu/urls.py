from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from decks.views import (
    decks_list_view,
    decks_detail_view,
    decks_feed_view,
    flashcard_create_view,
    flashcard_list_view,
)

from accounts.views import (
    login_view,
    logout_view,
    register_view,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', decks_feed_view),
    path('login/', login_view),
    path('logout/', logout_view),
    path('register', register_view),
    path('<int:deck_id>/', decks_detail_view),
    path('<int:deck_id>/flashcards/', flashcard_list_view),
    path('<int:deck_id>/flashcards/create/', flashcard_create_view),
    path('api/decks/', include('decks.api.urls')),
    path('profiles/', include('profiles.urls')),
    path('api/profiles/', include('profiles.api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
