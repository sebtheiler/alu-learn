from django.contrib import admin
from .models import ShortUrl, UrlHit, QuickFeedback, QuickFeedbackResponse, WelcomeInfo


class UrlHitAdmin(admin.ModelAdmin):
    model = UrlHit
    readonly_fields = ('timestamp',)
    search_fields = ('url__destination', 'user__user__username', 'user__user__first_name')
    ordering = ('-timestamp',)


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


admin.site.register(ShortUrl)
admin.site.register(UrlHit, UrlHitAdmin)
admin.site.register(QuickFeedback)
admin.site.register(QuickFeedbackResponse, QuickFeedbackResponseAdmin)
admin.site.register(WelcomeInfo)
