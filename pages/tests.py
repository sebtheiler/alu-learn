from django.contrib.auth import get_user_model
from profiles.models import ProfileSettings
from utils.test_utils import ImprovedTestCase

from .api import views as api_views
from .models import ContactFeedback

User = get_user_model()

class PagesTestClass(ImprovedTestCase):
    def test_contact_us_api(self):
        self.assertFalse(ContactFeedback.objects.exists())
        response = self.post_response('/api/pages/contactus/', api_views.contact_us_api_view, {
            'title': 'Title',
            'description': 'Description',
            'error_code': '1234',
            'urgency': 3,
            'contact_allowed': True,
            'is_legal_issue': False,
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ContactFeedback.objects.exists())
        feedback = ContactFeedback.objects.first()  # type: ContactFeedback
        self.assertIsNotNone(feedback)
        self.assertEqual(feedback.title, 'Title')
        self.assertEqual(feedback.description, 'Description')
        self.assertEqual(feedback.error_code, '1234')
        self.assertEqual(feedback.urgency, 3)
        self.assertEqual(feedback.contact_allowed, True)
        self.assertEqual(feedback.is_legal_issue, False)
    
    def test_update_settings_api(self):
        settings = self.user.profile.settings  # type: ProfileSettings
        self.assertEqual(settings.user_type, 'STUDENT')
        self.assertEqual(settings.ideal_time_per_day, 'MAX')
        self.assertEqual(settings.send_reminders, False)

        # "Update" settings without changing anything
        response = self.post_response('/api/pages/settings/', api_views.update_settings_api_view)
        self.assertEqual(response.status_code, 400)

        # Update settings
        response = self.post_response('/api/pages/settings/', api_views.update_settings_api_view, {'settings': {
            'user_type': 'TEACHER',
            'ideal_time_per_day': '20',
            'send_reminders': True,
        }})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(settings.user_type, 'TEACHER')
        self.assertEqual(settings.ideal_time_per_day, '20')
        self.assertEqual(settings.send_reminders, True)
    
    def test_explore_lists_api(self):
        response = self.get_response('/api/pages/explore/lists/', api_views.api_explore_lists_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertIsInstance(response.data['EDITOR'], list)
        self.assertIsInstance(response.data['TOP'], list)
        self.assertIsInstance(response.data['HOT'], list)
