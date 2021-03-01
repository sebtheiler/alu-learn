from .models import Assignment, AssignmentStudySessionManager, Classroom
from django.contrib import admin

# Register your models here.

admin.site.register(Classroom)
admin.site.register(Assignment)
admin.site.register(AssignmentStudySessionManager)