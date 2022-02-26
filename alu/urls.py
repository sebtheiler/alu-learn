from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView, TemplateView

favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)


urlpatterns = [
    path('super-secret-admin-123/', admin.site.urls),
    path('admin/', RedirectView.as_view(url='https://www.youtube.com/watch?v=dQw4w9WgXcQ', permanent=True)),
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    path('ads.txt', TemplateView.as_view(template_name='ads.txt', content_type='text/plain')),
    re_path(r'^favicon\.ico$', favicon_view),
    path('', include('decks.urls')), path('api/decks/', include('decks.api.urls')),
    path('api/skill_tree/', include('skill_tree.api.urls')),
    path('', include('pages.urls')), path('api/pages/', include('pages.api.urls')),
    path('', include('teachers.urls')), path('api/teachers/', include('teachers.api.urls')),
    path('profiles/', include('profiles.urls')), path('api/profiles/', include('profiles.api.urls')),
    path('', include('analytics.urls')), path('api/analytics/', include('analytics.api.urls')),
    path('', include('habits.urls')), path('api/habits/', include('habits.api.urls')),
    path('api/sharing_system/', include('sharing_system.api.urls')),
    path('api/accounts/', include('accounts.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += static(
        settings.UPLOADED_FILES_URLPATH,
        document_root=settings.UPLOADED_FILES_FILEPATH,
    )
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT,
    )
    urlpatterns += (
        url('__debug__/', include(debug_toolbar.urls)),
    )
