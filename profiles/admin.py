from django.contrib import admin
from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment, ProfileSettings


def new_update(modeladmin, request, queryset):
    queryset.update(show_update_modal=True)
new_update.short_description = "Alert users of new update"

class ProfileSettingsAdmin(admin.ModelAdmin):
    model = ProfileSettings
    actions = [new_update]


admin.site.register(Profile)
admin.site.register(Notification)
admin.site.register(ProfileBadge)
admin.site.register(ProfileHistorySegment)
admin.site.register(ProfileSettings, ProfileSettingsAdmin)