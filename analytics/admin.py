from django.contrib import admin
from .models import ExperimentController, Experiment, ShortUrl, UrlHit


class UrlHitAdmin(admin.ModelAdmin):
    model = UrlHit
    readonly_fields = ['timestamp']
    search_fields = ['url__destination', 'user__user__username', 'user__user__first_name']
    ordering = ['-timestamp']


admin.site.register(ExperimentController)
admin.site.register(Experiment)
admin.site.register(ShortUrl)
admin.site.register(UrlHit, UrlHitAdmin)
