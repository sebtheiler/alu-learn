from django.contrib import admin
from .models import ContactFeedback, UploadedImage


class ContactFeedbackAdmin(admin.ModelAdmin):
    search_fields = ('title',)
    readonly_fields = ('timestamp',)


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
