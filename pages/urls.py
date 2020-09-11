from django.urls import path

from . import views
urlpatterns = [
    # General pages
    path('home/', views.home_page),
    path('settings/', views.settings_view),
    path('profile/', views.profile_redirect_view),
    path('login/', views.login_view),
    # "Tutorial" pages
    path('help/welcome/', views.welcome_view),
    # Manual pages
    path('help/', views.md_view_wrapper('main', 'User Guide')),
    path('help/flashcard-tags/', views.md_view_wrapper('decks/flashcard-tags', 'Flashcard Tags')),
    path('help/suspended/', views.md_view_wrapper('decks/flashcard-suspended', 'Suspended Flashcards')),
    path('help/leeches/', views.md_view_wrapper('decks/flashcard-leech', 'Leech Flashcards')),
    path('help/freezing-fields/', views.md_view_wrapper('decks/flashcard-field-freezing', 'Freezing Fields in Flashcard Creation')),
    # Legal pages
    path('legal/tos/', views.md_view_wrapper('tos', 'legal')),
    path('legal/privacypolicy/', views.md_view_wrapper('privacy-policy', 'legal')),
    # Contact pages
    path('contactus/', views.contact_view_wrapper(is_legal_issue=False)),
    path('contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=False)),
    path('legal/contactus/', views.contact_view_wrapper(is_legal_issue=True)),
    path('legal/contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=True)),
]
