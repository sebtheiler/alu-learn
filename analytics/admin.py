from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.db.models import Q
from django.utils.encoding import force_text

from .models import (QuickFeedback, QuickFeedbackResponse, ShortUrl, UrlHit,
                     WelcomeInfo)


class UrlHitOtherFilter(SimpleListFilter):
    title = 'User Agent'
    parameter_name = 'user_agent'

    def lookups(self, request, model_admin):
        return (
            ('all', 'All'),
            (None, 'Exclude "Other"'),
            ('include_other', 'Only "Other"'),
        )

    def queryset(self, request, queryset):
        if not self.value():
            # Default exclude other
            return queryset.filter(~Q(user_agent__icontains='other'))
        elif self.value() == 'include_other':
            return queryset.filter(user_agent__icontains='other')
        elif self.value() == 'all':
            return queryset

    # Taken from https://stackoverflow.com/a/53821728/10226703
    # Removes the default 'All' option
    def choices(self, changelist):
        for lookup, title in self.lookup_choices:
            yield {
                'selected': self.value() == force_text(lookup),
                'query_string': changelist.get_query_string({self.parameter_name: lookup}, []),
                'display': title,
            }


class UrlHitAdmin(admin.ModelAdmin):
    model = UrlHit
    readonly_fields = ('timestamp',)
    search_fields = ('url__destination', 'user__user__username', 'user__user__first_name')
    ordering = ('-timestamp',)
    list_display = (
        'url',
        'username',
        'timestamp',
        'user_agent',
        'ip_address',
        'referer',
    )
    list_filter = (UrlHitOtherFilter,)

    def get_queryset(self, request):
        queryset = super(UrlHitAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('user__user')
        return queryset

    def username(self, obj):
        return obj.user.user.username if obj.user is not None else None


class QuickFeedbackResponseAdmin(admin.ModelAdmin):
    model = QuickFeedbackResponse
    list_display = ('quick_feedback', 'user', 'answer')
    readonly_fields = ('user', 'quick_feedback', 'answer')
    search_fields = (
        'quick_feedback__prompt',
        'user__user__first_name',
        'user__user__last_name',
        'user__user__username',
    )
    ordering = ('-pk',)


class WelcomeInfoAdmin(admin.ModelAdmin):
    model = WelcomeInfo
    list_display = (
        'user',
        'user_type',
        'referrer',
        'join_reason',
        'target_flashcards',
        'send_reminders',
        'timestamp',
    )

    def get_queryset(self, request):
        queryset = super(WelcomeInfoAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('user')
        return queryset


admin.site.register(ShortUrl)
admin.site.register(UrlHit, UrlHitAdmin)
admin.site.register(QuickFeedback)
admin.site.register(QuickFeedbackResponse, QuickFeedbackResponseAdmin)
admin.site.register(WelcomeInfo, WelcomeInfoAdmin)
