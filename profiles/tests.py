import random

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Profile

User = get_user_model()

class ProfileTestCase(TestCase):
    def setUp(self):
        # Create random users
        self.num_users = 5
        self.users = []
        for i in range(self.num_users):
            self.users.append(User.objects.create_user(username='User - ' + str(i), password='p@ssword'))
    
    def get_client(self, user_id=0):
        client = APIClient()
        if user_id is not None:
            client.login(username=self.users[user_id].username, password='p@ssword')
        return client

    def test_profile_created_via_signal(self):
        profile_qs = Profile.objects.all()
        self.assertEqual(profile_qs.count(), self.num_users)

    def test_friending(self):
        # User0 and User1 are now friends
        self.users[0].profile.friends.add(self.users[1])

        self.assertEqual(self.users[0].profile.friends.count(), 1)
        self.assertEqual(self.users[1].friends.count(), 1)

    def test_friend_api_endpoint(self):
        client = self.get_client(0)

        # Friend User1
        response = client.post(f'/api/profiles/{self.users[1].username}/friend/', 
            {'action': 'friend'}
        )
        self.assertEqual(response.json().get('friend_count'), 1)

        # Unfriend User1
        response = client.post(f'/api/profiles/{self.users[1].username}/friend/', 
            {'action': 'unfriend'}
        )
        self.assertEqual(response.json().get('friend_count'), 0)
    
    def test_friend_self(self):
        client = self.get_client()

        # Attempt to friend self
        response = client.post(f'/api/profiles/{self.users[0].username}/friend/', 
            {'action': 'friend'}
        )
        self.assertEqual(response.json().get('message'), 'You cannot friend yourself')

        # Attempt to unfriend self
        response = client.post(f'/api/profiles/{self.users[0].username}/friend/', 
            {'action': 'unfriend'}
        )
        self.assertEqual(response.json().get('message'), 'You cannot friend yourself')

    def test_bad_action(self):
        client = self.get_client(0)

        # Send bad action
        response = client.post(f'/api/profiles/{self.users[1].username}/friend/', 
            {'action': 'jeijfoiwejfwpeoijf'}
        )
        self.assertEqual(response.json().get('message'), 'Unknown action')
    
    def test_friend_nonexistant_user(self):
        client = self.get_client(0)

        # Friend nonexistant user
        response = client.post(f'/api/profiles/wasdwdafefae/friend/', 
            {'action': 'friend'}
        )
        self.assertEqual(response.status_code, 404)

        # Unfriend nonexistant user
        response = client.post(f'/api/profiles/wasdwdafefae/friend/', 
            {'action': 'unfriend'}
        )
        self.assertEqual(response.status_code, 404)
    
    def test_unfriend_notfriended(self):
        client = self.get_client(0)

        # Unfriend User1
        response = client.post(f'/api/profiles/{self.users[1].username}/friend/', 
            {'action': 'unfriend'}
        )
        self.assertEqual(response.json().get('message'), 'You cannot unfriend a user who is not your friend')