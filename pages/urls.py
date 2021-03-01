from utils import render_basic_view
from django.urls import path

from . import views
urlpatterns = [
    # General pages
    path('', views.landing_page),
    path('home/', views.home_page),
    path('profile/', views.profile_redirect_view),
    path('login/', views.login_view),
    path('eli/', render_basic_view('misc/eli.html', False, False)),
    path('confirm-email/', views.confirm_email_view),
    path('reset-password/', views.send_password_reset),
    path('reset-password/confirm/', views.change_reset_password_view_wrapper(True)),
    path('changelog/', views.md_view_wrapper('misc/changelog', 'Changelog')),
    # Explore pages
    path('explore/', views.explore_home_view),
    path('explore/decks/search/', render_basic_view('explore/search-decks.html', False, False)),
    # Settings
    path('settings/', render_basic_view('misc/settings/settings.html')),
    path('settings/change-password/', views.change_reset_password_view_wrapper(False)),
    path('settings/change-email/', render_basic_view('misc/settings/change-email.html', True, False)),
    # Tutorial pages
    path('help/welcome/', views.welcome_view),
    path('help/', views.md_view_wrapper('main', 'User Guide')),
    path('help/faq/', views.md_view_wrapper('misc/faq', 'FAQ')),
    path('help/flashcard-tags/', views.md_view_wrapper('decks/flashcard-tags', 'Flashcard Tags')),
    path('help/suspended/', views.md_view_wrapper('decks/flashcard-suspended', 'Suspended Flashcards')),
    path('help/leeches/', views.md_view_wrapper('decks/flashcard-leech', 'Leech Flashcards')),
    path('help/freezing-fields/', views.md_view_wrapper('decks/flashcard-field-freezing', 'Freezing Fields in Flashcard Creation')),
    path('help/cloze-deletion/', views.md_view_wrapper('decks/cloze-deletion', 'Cloze Deletion')),
    path('help/writing-latex/', views.md_view_wrapper('decks/writing-latex', 'LaTeX')),
    path('help/selection-mode/', views.md_view_wrapper('decks/selection-mode', 'Selection Mode')),
    # Legal pages
    path('legal/', views.md_view_wrapper('legal/main', 'Legal Documents')),
    path('legal/tos/', views.md_view_wrapper('legal/ToS', 'Terms of Service')),
    path('legal/privacypolicy/', views.md_view_wrapper('legal/PrivacyPolicy', 'Privacy Policy')),
    path('legal/dmca/', views.md_view_wrapper('legal/DMCA', 'Digital Millenium Copyright Notice')),
    # Contact pages
    path('contactus/', views.contact_view_wrapper(is_legal_issue=False)),
    path('contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=False)),
    path('legal/contactus/', views.contact_view_wrapper(is_legal_issue=True)),
    path('legal/contactus/finished/', views.contact_finished_view_wrapper(is_legal_issue=True)),
]
