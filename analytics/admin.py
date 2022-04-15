from django.contrib import admin
from .models import ShortUrl, UrlHit, QuickFeedback, QuickFeedbackResponse, WelcomeInfo


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
