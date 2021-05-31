from django.contrib import admin
from .models import Habit, Routine


class HabitAdmin(admin.ModelAdmin):
    model = Habit
    ordering = ('-id',)  # override the default `habit_num` ordering


admin.site.register(Habit, HabitAdmin)
admin.site.register(Routine)
