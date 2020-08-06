from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class ProfileTestCase(TestCase):
    def setUp(self):
        # Create random users
        self.num_users = 5
        self.users = []
        for i in range(self.num_users):
            self.users.append(User.objects.create_user(username='User - ' + str(i), password='p@ssword'))
    
    def test_profile_created_via_signal(self):
        profile_qs = Profile.objects.all()
        self.assertEqual(profile_qs.count(), self.num_users)

    def test_following(self):
        # User0 and User1 are now friends
        self.users[0].profile.friends.add(self.users[1])

        self.assertEqual(self.users[0].profile.friends.count(), 1)
        self.assertEqual(self.users[1].friends.count(), 1)