import datetime as dt

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.handlers.wsgi import WSGIRequest
from utils.test_utils import ImprovedTestCase, SeleniumTestCase

from .api import views as api_views
from .models import Notification, Profile, ProfileHistorySegment, ProfileSettings

User = get_user_model()


class ProfileTestCase(ImprovedTestCase):
    def test_profile_created_via_signal(self):
        profile_qs = Profile.objects.all()
        self.assertEqual(profile_qs.count(), self.num_users)

    def test_profile_detail_api(self):
        response = self.get_response(
            'user1',
            api_views.profile_detail_api_view,
            kwargs={'username': 'user1'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'user1')
        self.assertEqual(response.data['last_name'], 'Smith')

        response = self.get_response(f'/api/profiles/{self.num_users}/detail/', api_views.profile_detail_api_view,
            kwargs={'username': f'user{self.num_users}'}
        )
        self.assertEqual(response.status_code, 404)

    def test_friend_request_api(self):
        user1 = self.users[0]  # type: User
        user2 = self.users[1]  # type: User
        api_path1 = f'/api/profiles/{user1.username}/friend/'
        api_path2 = f'/api/profiles/{user2.username}/friend/'

        # Send friend request from user1 to user2
        num_notifs = Notification.objects.count()
        response = self.post_response(api_path2, api_views.friend_request_api_view,
            kwargs={'recipient_username': user2.username}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Notification.objects.count(), num_notifs + 1, 'Friend request notification not created')
        self.assertEqual(user2.profile.pending_friends.count(), 1, 'User1 not added to User2\'s pending friends')

        # Attempt to send another friend request from user1 to user2
        response = self.post_response(api_path2, api_views.friend_request_api_view,
            kwargs={'recipient_username': user2.username}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Notification.objects.count(), num_notifs + 1, 'New notification unexpectedly created')

        # Accept friend request
        response = self.post_response(api_path1, api_views.friend_request_api_view,
            kwargs={'recipient_username': user1.username}, user=user2,
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(user2.profile.pending_friends.count(), 0, 'User1 not removed from User2\'s pending friends')
        self.assertEqual(user1.friends.count(), 1)
        self.assertEqual(user2.friends.count(), 1)

    def test_friend_toggle_api(self):
        recipient = self.users[1]
        api_path = f'/api/profiles/{recipient.username}/friend/'
        api_view = api_views.friend_toggle_api_view
        kwargs = {'recipient_username': recipient.username}

        # Add friend
        response = self.post_response(api_path, api_view, {
            'action': 'friend',
        }, kwargs=kwargs)
        recipient = User.objects.get(pk=recipient.pk)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(recipient.profile.pending_friends.count(), 0)
        self.assertEqual(recipient.profile.friends.count(), 0)

        self.user.profile.pending_friends.add(recipient)
        response = self.post_response(api_path, api_view, {
            'action': 'friend',
        }, kwargs=kwargs)
        recipient = User.objects.get(pk=recipient.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.profile.pending_friends.count(), 0)
        self.assertEqual(self.user.profile.friends.count(), 1)

        # Remove friend
        response = self.post_response(api_path, api_view, {
            'action': 'unfriend',
        }, kwargs=kwargs)
        recipient = User.objects.get(pk=recipient.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.profile.pending_friends.count(), 0)
        self.assertEqual(self.user.profile.friends.count(), 0)

        response = self.post_response(api_path, api_view, {
            'action': 'unfriend',
        }, kwargs=kwargs)
        recipient = User.objects.get(pk=recipient.pk)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.user.profile.pending_friends.count(), 0)
        self.assertEqual(self.user.profile.friends.count(), 0)

    def test_notification_get_api(self):
        response = self.get_response(f'/api/profiles/notifactions/', api_views.notification_api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['results'], list)
        self.assertGreaterEqual(response.data['count'], 1)
        self.assertIsInstance(response.data['results'][0]['id'], int)

    def test_notification_post_api(self):
        user = self.users[0] #  type: User
        response = self.post_response(f'/api/profiles/notifactions/', api_views.notification_api_view,
            data={
                'title': 'Title',
                'description': 'Description',
                'category': 'basic',
            },
            kwargs={'username': user.username}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['title'], 'Title')
        self.assertEqual(response.data['description'], 'Description')
        self.assertEqual(response.data['category'], 'basic')

    def test_get_unread_notifs_api(self):
        user = self.users[0]
        response = self.get_response(f'/api/profiles/notifactions/read/', api_views.notification_read_api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        num_unread = len(response.data)

        # Create unread notification
        Notification.objects.create(
            profile=user.profile,
            title='Title',
        )
        response = self.get_response(f'/api/profiles/notifactions/read/', api_views.notification_read_api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), num_unread + 1)

    def test_check_username_available_api(self):
        # Taken email and username
        api_path = '/api/profiles/available/?username=user1&email=agent1@smith.com'
        response = self.get_response(api_path, api_views.check_username_available_api_view, is_anon=True)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertFalse(response.data['username_is_available'])
        self.assertFalse(response.data['email_is_available'])

        # Available email and username
        api_path = '/api/profiles/available/?username=unique&email=unique@email.net'
        response = self.get_response(api_path, api_views.check_username_available_api_view, is_anon=True)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertTrue(response.data['username_is_available'])
        self.assertTrue(response.data['email_is_available'])

    def test_create_profile_api(self):
        response = self.post_response('/api/profiles/create/', api_views.create_profile_api_view, {
            'birthdate': {'year': 2005, 'month': 'May', 'day': 2},
            'email': 'test@fakedomain123.edu',
            'username': 'testuser',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'password',
        })
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data, dict)
        user = User.objects.filter(profile__pk=response.data['id']).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'John')
        self.assertEqual(user.last_name, 'Doe')
        self.assertEqual(user.email, 'test@fakedomain123.edu')
        self.assertEqual(user.profile.birthdate, dt.date(2005, 5, 2))
        self.assertTrue(user.check_password('password'))

        response = self.post_response('/api/profiles/create/', api_views.create_profile_api_view)
        self.assertEqual(response.status_code, 400)

    def test_email_change_api(self):
        user = self.users[0]
        num_unconfirmed_emails = len(user.unconfirmed_emails)
        response = self.post_response('/api/profiles/changeemail/', api_views.change_email, {
            'password': 'password',
            'new_email': 'anotherfakeemail@anotherfakedomain123.net',
        })
        self.assertFalse(isinstance(response, WSGIRequest))
        self.assertEqual(len(user.unconfirmed_emails), num_unconfirmed_emails + 1)

        # Attempt to change email without password or new email
        response = self.post_response('/api/profiles/changeemail/', api_views.change_email)
        self.assertEqual(response.status_code, 401)

    def test_password_reset_email_api(self):
        # Get user
        user = self.users[0]
        api_path = f'/api/profiles/resetpassword/{user.email}/'
        self.assertIsNone(user.password_reset_key)

        # Send reset
        response = self.post_response(api_path, api_views.password_reset_email_api_view,
            kwargs={'email': user.email}
        )
        self.assertEqual(response.status_code, 200)

        # Validate reset sent
        user = User.objects.get(pk=user.pk)
        self.assertIsNotNone(user.password_reset_key)

        # Test password reset
        self.assertFalse(user.check_password('password1'))
        reset_key = user.password_reset_key
        response = self.post_response('/api/profiles/changepassword/', api_views.change_password, {
            'email': user.email,
            'reset_key': reset_key,
            'new_password': 'password1',
        }, user=AnonymousUser())
        user = User.objects.get(pk=user.pk)
        self.assertFalse(isinstance(response, WSGIRequest))
        self.assertTrue(user.check_password('password1'))
        self.assertIsNone(user.password_reset_key)

        # Try to reset without a key
        response = self.post_response('/api/profiles/changepassword/', api_views.change_password, {
            'email': user.email,
            'reset_key': reset_key,
            'new_password': 'password2',
        }, user=AnonymousUser())
        user = User.objects.get(pk=user.pk)
        self.assertEqual(response.status_code, 401)
        self.assertFalse(user.check_password('password2'))
        self.assertIsNone(user.password_reset_key)

        # Test password change
        response = self.post_response('/api/profiles/changepassword/', api_views.change_password, {
            'old_password': 'password1',
            'new_password': 'password3',
        }, user=user)
        user = User.objects.get(pk=user.pk)
        self.assertFalse(isinstance(response, WSGIRequest))
        self.assertTrue(user.check_password('password3'))

    def test_user_friend_list_api(self):
        user = self.users[0]
        api_path = f'/api/profiles/{user.username}/friends/'

        # Test with no friends
        response = self.get_response(api_path, api_views.get_user_friends_api_view, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)

        # Add friend and test again
        user.friends.add(self.users[1].profile)
        self.users[1].friends.add(user.profile)

        response = self.get_response(api_path, api_views.get_user_friends_api_view, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.users[1].pk)

    def test_profile_history_api(self):
        user = self.users[0]
        api_path = f'/api/profiles/{user.username}/history/'

        # Test with no history
        response = self.get_response(api_path, api_views.profile_history_view, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)

        # Create history and test again
        history = ProfileHistorySegment.objects.create(profile=user.profile)
        response = self.get_response(api_path, api_views.profile_history_view, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['cards_done'], 0)
        self.assertEqual(response.data[0]['time_spent'], 0)
        self.assertEqual(response.data[0]['id'], history.pk)

    def test_confirm_email_api(self):
        user = self.users[0]
        api_path = f'/api/profiles/confirmemail/{user.username}/'
        self.assertFalse(user.is_confirmed)

        # Test with invalid confirmation
        response = self.post_response(api_path, api_views.confirm_email_api_view, {
            'username': user.username,
            'confirmation_key': '123456',
        }, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(user.is_confirmed)

        # Confirm email
        response = self.post_response(api_path, api_views.confirm_email_api_view, {
            'username': user.username,
            'confirmation_key': user.confirmation_key,
        }, kwargs={'username': user.username})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(user.is_confirmed)

    def test_read_changelog_api(self):
        user = self.users[0]
        self.assertFalse(user.profile.settings.show_update_modal)

        user.profile.settings.show_update_modal = True
        user.profile.settings.save()
        user = User.objects.get(pk=user.pk)
        self.assertTrue(user.profile.settings.show_update_modal)

        response = self.post_response('/api/profiles/read-popup/', api_views.read_changelog_popup_api_view)
        user = User.objects.get(pk=user.pk)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(user.profile.settings.show_update_modal)


class ProfileBrowserTestCase(SeleniumTestCase):
    def test_deck_homepage(self):
        self.common_login()

        # Check the landing notification worked
        self.assertEqual(
            Notification.objects.count(),
            len(self.users),
        )
        self.assertEqual(
            Notification.objects.filter(profile=self.user.profile, read=False).count(),
            1,
        )
        self.assertTextNotExists('Notifications')
        self.driver.find_element_by_class_name('notification-bell').click()
        self.assertTextExists('Notifications')
        self.assertTextExists('Need help?')
        self.assertTextExists('seconds ago')

        # Make sure the notification is marked as read after the popup is closed
        self.driver.find_element_by_xpath('//body').click()
        self.sleep(0.5)
        self.assertEqual(
            Notification.objects.filter(profile=self.user.profile, read=False).count(),
            0,
        )

        # Go to someone's profile and friend them
        self.driver.get(f'{self.live_server_url}/profiles/u/{self.users[1].username}/')
        self.driver.find_element_by_class_name('friend-btn').click()
        self.sleep(0.5)
        self.assertEqual(
            self.users[1].profile.pending_friends.first(),
            self.user,
        )
        self.assertEqual(
            Notification.objects.filter(profile=self.users[1].profile, read=False).count(),
            2,  # one for signing up, one for the friend request
        )

        # Simulate someone else sending a friend request to the user
        self.user.profile.request_friend(self.users[2])
        self.assertEqual(
            Notification.objects.filter(profile=self.user.profile, read=False).count(),
            1,
        )
        self.driver.refresh()
        self.driver.find_element_by_class_name('notification-bell').click()
        self.sleep(1)
        self.assertTextExists('Add Friend')
        self.driver.find_element_by_class_name('notif-friend-btn').click()
        self.sleep(0.1)
        self.assertTextExists('Friends')
        self.driver.find_element_by_xpath('//body').click()
        self.sleep(0.5)
        self.assertEqual(
            Notification.objects.filter(profile=self.user.profile, read=False).count(),
            0,
        )
        self.assertEqual(
            self.user.profile.friends.first(),
            self.users[2],
        )

        # Have users[1] accept the original friend request
        self.assertTextExists('Requested')
        message = self.user.profile.toggle_friend(self.users[1], 'friend')
        self.assertIsNone(message)
        self.driver.refresh()
        self.assertTextExists('Remove Friend')

        # Remove friend
        self.assertEqual(
            self.user.profile.friends.count(),
            2,
        )
        self.driver.find_element_by_class_name('friend-btn').click()
        self.driver.switch_to.alert.accept()
        self.sleep(0.5)
        self.assertTextExists('Add Friend')
        self.assertEqual(
            self.user.profile.friends.count(),
            1,
        )

        # Go to homepage
        self.driver.get(f'{self.live_server_url}/home/')
        self.driver.find_element_by_id('friends-btn').click()
        self.assertTextNotExists('You don\'t have any friends yet')
        self.assertTextExists(self.user.profile.friends.first().username)

        # Go to own profile
        self.driver.find_element_by_id('profile-dropdown').click()
        self.driver.find_element_by_id('profile-option').click()
        self.sleep(0.5)
        self.assertTextExists('Edit Profile')

        # Change profile settings
        self.driver.find_element_by_id('profile-dropdown').click()
        self.driver.find_element_by_id('settings-option').click()
        self.sleep(0.5)
        self.assertTextExists('Save Changes')

        settings = self.user.profile.settings  # type: ProfileSettings
        self.assertEqual(settings.send_reminders, False)
        self.assertEqual(settings.ideal_time_per_day, 'MAX')
        self.assertEqual(settings.user_type, 'STUDENT')
        self.driver.find_element_by_name('sendReminders').click()
        self.click_option('5')
        self.click_option('TEACHER')
        self.driver.find_element_by_id('save-changes-btn').click()
        self.sleep(0.5)

        settings = ProfileSettings.objects.get(pk=settings.pk)
        self.assertEqual(settings.send_reminders, True)
        self.assertEqual(settings.ideal_time_per_day, '5')
        self.assertEqual(settings.user_type, 'TEACHER')

        # Logout and create a new profile
        self.driver.find_element_by_id('profile-dropdown').click()
        self.driver.find_element_by_id('logout-option').click()
        self.sleep(0.5)

        self.driver.get(self.live_server_url)
        self.driver.find_element_by_id('main-signup-btn').click()
        self.click_option('Dec')
        self.click_option('31')
        self.click_option('2019')
        self.assertTextExists('Parent/guardian\'s email')
        self.click_option('Jan')
        self.click_option('1')
        self.click_option('1900')
        self.assertTextNotExists('Parent/guardian\'s email')
        self.fill_text_element('registerFirstName', 'First')
        self.fill_text_element('registerLastName', 'Last')
        self.fill_text_element('registerUsername', 'username')
        self.fill_text_element('registerEmail', 'email@email.com')
        self.fill_text_element('registerPassword', 'p@ssword')
        self.driver.find_element_by_id('register-accept-tos').click()

        self.assertEqual(
            Profile.objects.count(),
            len(self.users),
        )
        self.driver.find_element_by_id('register-signup').click()
        self.assertTextExists('Your email is not currently in the list of allowed emails')
        self.assertEqual(
            Profile.objects.count(),
            len(self.users),
        )

        self.fill_text_element('registerEmail', 'allowedemail@abcdef123xyz.com')
        self.driver.find_element_by_id('register-signup').click()
        self.sleep(1)
        self.assertEqual(
            Profile.objects.count(),
            len(self.users) + 1,
        )
        profile = Profile.objects.last()
        self.assertEqual(profile.user.first_name, 'First')
        self.assertEqual(profile.user.last_name, 'Last')
        self.assertEqual(profile.user.username, 'username')
        self.assertEqual(profile.user.email, 'allowedemail@abcdef123xyz.com')

        # Confirm email
        self.assertTextExists('Confirm Email')
        self.fill_text_element('confirmationCode', 'abc123')
        self.driver.find_element_by_id('confirm-email-btn').click()
        self.assertTextExists('Invalid confirmation code')

        self.fill_text_element('confirmationCode', profile.user.confirmation_key)
        self.driver.find_element_by_id('confirm-email-btn').click()

        # Personalize form
        self.click_option('TEACHER')
        self.driver.find_element_by_id('next-btn').click()
        self.click_option('10')
        self.driver.find_element_by_id('next-btn').click()
        self.click_option('NO')
        self.driver.find_element_by_id('next-btn').click()
        self.sleep(0.5)
        self.assertEqual(profile.settings.user_type, 'TEACHER')
        self.assertEqual(profile.settings.ideal_time_per_day, '10')
        self.assertEqual(profile.settings.send_reminders, False)
