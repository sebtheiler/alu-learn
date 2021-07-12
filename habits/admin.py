from django.contrib import admin
from .models import Habit, Routine, Todo


class HabitAdmin(admin.ModelAdmin):
    model = Habit
    ordering = ('-id',)  # override the default `habit_num` ordering


admin.site.register(Habit, HabitAdmin)
admin.site.register(Routine)
admin.site.register(Todo)
