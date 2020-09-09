from django.contrib import admin
from .models import ContactFeedback


class IsLegalFilter(admin.SimpleListFilter): # https://timonweb.com/django/adding-custom-filters-to-django-admin-is-easy/
  title = 'Is legal issue' # a label for our filter
  parameter_name = 'is_legal' # you can put anything here

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
    search_fields = ['title']
    list_filter = (IsLegalFilter,)

admin.site.register(ContactFeedback, ContactFeedbackAdmin)