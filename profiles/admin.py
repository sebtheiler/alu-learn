from django.contrib import admin
from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment, ProfileSettings


admin.site.register(Profile)
admin.site.register(Notification)
admin.site.register(ProfileBadge)
admin.site.register(ProfileHistorySegment)
admin.site.register(ProfileSettings)