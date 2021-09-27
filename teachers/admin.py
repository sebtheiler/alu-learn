from .models import Assignment, Classroom
from django.contrib import admin


class ClassroomAdmin(admin.ModelAdmin):
    search_fields = ('title',)
    list_display = (
        'title',
        'code',
        'shared_deck',
    )
    filter_horizontal = (
        'teachers',
        'students',
    )
    model = Classroom

    def get_queryset(self, request):
        queryset = super(ClassroomAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('students__user')
        return queryset


admin.site.register(Classroom, ClassroomAdmin)
admin.site.register(Assignment)
