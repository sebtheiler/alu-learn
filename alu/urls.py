from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from decks import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.decks_list_view),
    path('<int:deck_id>/', views.decks_detail_view),
    path('profile/<str:username>/', views.decks_profile_view),
    path('api/decks/', include('decks.api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
