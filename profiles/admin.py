from django.contrib import admin
from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment


admin.site.register(Profile)
admin.site.register(Notification)
admin.site.register(ProfileBadge)
admin.site.register(ProfileHistorySegment)