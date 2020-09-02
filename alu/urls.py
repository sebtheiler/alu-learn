from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from decks.views import (
    decks_list_view,
    decks_detail_view,
    decks_home_view,
    deck_study_view,
    custom_study_view,
    flashcard_create_view,
    flashcard_list_view,
    flashcard_edit_view,
    flashcard_search_view,
)

from pages.views import (
    landing_page,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing_page),
    path('home/decks/', decks_home_view),
    path('customstudy/', custom_study_view),
    path('flashcards/search/', flashcard_search_view),
    path('decks/<int:deck_id>/', decks_detail_view),
    path('decks/<int:deck_id>/study/', deck_study_view),
    path('decks/<int:deck_id>/flashcards/', flashcard_list_view),
    path('decks/<int:deck_id>/flashcards/create/', flashcard_create_view),
    path('decks/<int:deck_id>/flashcards/<int:flashcard_id>/edit/', flashcard_edit_view),
    path('', include('pages.urls')),
    path('api/decks/', include('decks.api.urls')),
    path('profiles/', include('profiles.urls')),
    path('api/profiles/', include('profiles.api.urls')),
    path('explore/', include('explore.urls')),
    path('api/explore/', include('explore.api.urls')),
    path('api/deckimporter/', include('deckimporter.api.urls')),
    path('api/analytics/', include('analytics.api.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns