from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from pages.views import (
    landing_page,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', landing_page),
    path('', include('decks.urls')), path('api/decks/', include('decks.api.urls')),
    path('', include('notes.urls')), path('api/notes/', include('notes.api.urls')),
    path('', include('pages.urls')), path('api/pages/', include('pages.api.urls')),
    path('profiles/', include('profiles.urls')), path('api/profiles/', include('profiles.api.urls')),
    path('explore/', include('explore.urls')), path('api/explore/', include('explore.api.urls')),
    path('api/analytics/', include('analytics.api.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns