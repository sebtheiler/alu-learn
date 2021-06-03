from django.contrib import admin
from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment, ProfileSettings


def new_update(modeladmin, request, queryset):
    queryset.update(show_update_modal=True)


new_update.short_description = "Alert users of new update"


class ProfileSettingsAdmin(admin.ModelAdmin):
    model = ProfileSettings
    actions = [new_update]


class ProfileAdmin(admin.ModelAdmin):
    model = Profile
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


class ProfileHistorySegmentAdmin(admin.ModelAdmin):
    model = ProfileHistorySegment
    list_display = (
        'date', 'profile', 'cards_done',
        'habits_done', 'formatted_time_spent',
        'time_per_card',
    )
    list_filter = ('date',)
    search_fields = (
        'profile__user__first_name',
        'profile__user__last_name',
        'profile__user__username',
    )
    ordering = ('-date',)

    def formatted_time_spent(self, obj):
        seconds = obj.time_spent / 1000
        if seconds < 60:
            time = seconds
            unit = 'seconds'
        elif seconds / 60 < 60:
            time = seconds / 60
            unit = 'minutes'
        else:
            time = seconds / 60 / 60
            unit = 'hours'
        return f'{time:.2f} {unit}'

    def time_per_card(self, obj):
        seconds = obj.time_spent / 1000
        try:
            return f'{(seconds / obj.cards_done):.2f} seconds'
        except ZeroDivisionError:
            return 0


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Notification)
admin.site.register(ProfileBadge)
admin.site.register(ProfileHistorySegment, ProfileHistorySegmentAdmin)
admin.site.register(ProfileSettings, ProfileSettingsAdmin)
