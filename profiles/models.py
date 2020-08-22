from django.conf import settings
from django.db import models
from django.db.models.signals import post_save

User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=220, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    pending_friends = models.ManyToManyField('self', blank=True)
    total_thanks_recieved = models.IntegerField(default=0)

    def __str__(self):
        if self.user.first_name and self.user.last_name:
            return f'{self.user.first_name} {self.user.last_name} - @{self.user.username}'
        else:
            return f'@{self.user.username}'
    
    def increment_total_thanks_recieved(self):
        # Do not use this method if you need to make other changes to the profile obj
        # Only use this method if the `total_thanks_recieved` is the only attr that needs to be changed
        self.total_thanks_recieved += 1
        self.save()
        return self.total_thanks_recieved


class Notification(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    category = models.CharField(max_length=32, default='basic')
    title = models.CharField(max_length=128)
    description = models.TextField(default='')
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title}: {self.description} | {self.category}'


class ProfileBadge(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='badges')
    choosen = models.BooleanField(default=False)
    full_title = models.CharField(max_length=32)
    short_title = models.CharField(max_length=16)
    color = models.CharField(max_length=32)


# When a user is saved, create a corresponding Profile object
def user_did_save(sender, instance, created, *args, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)

post_save.connect(user_did_save, sender=User)