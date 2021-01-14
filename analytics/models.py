from profiles.models import Profile
from django.db import models


class ShortUrl(models.Model):
    code = models.CharField(max_length=6, unique=True)
    destination = models.CharField(max_length=256)

    def __str__(self) -> str:
        return f'{self.code} => {self.destination}'


class UrlHit(models.Model):
    url = models.ForeignKey(ShortUrl, on_delete=models.CASCADE, related_name='hits')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='hits', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=200)
    ip_address = models.CharField(max_length=45)

    def __str__(self) -> str:
        return f'URL Hit by "{self.user}" on "{self.url}"'
