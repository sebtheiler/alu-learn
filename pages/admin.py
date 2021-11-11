from django.contrib import admin
from .models import ContactFeedback, UploadedImage


class IsLegalFilter(admin.SimpleListFilter):
    title = 'Is legal issue'
    parameter_name = 'is_legal'

    def lookups(self, request, model_admin):
        # This is where you create filter options; we have two:
        return [
            ('is_legal', 'Legal issue'),
            ('not_legal', 'Not a legal issue'),
        ]

    def queryset(self, request, queryset):
        # This is where you process parameters selected by use via filter options:
        return queryset.distinct().filter(is_legal_issue=self.value() == 'is_legal')


class ContactFeedbackAdmin(admin.ModelAdmin):
    search_fields = ('title',)
    readonly_fields = ('timestamp',)
    list_filter = (IsLegalFilter,)


class UploadedImageAdmin(admin.ModelAdmin):
    list_display = (
        'image',
        'description',
        'original_url',
        'timestamp',
    )
    ordering = ('-timestamp',)


admin.site.register(ContactFeedback, ContactFeedbackAdmin)
admin.site.register(UploadedImage, UploadedImageAdmin)
