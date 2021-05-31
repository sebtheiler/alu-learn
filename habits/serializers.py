from rest_framework import serializers
from .models import Habit, Routine


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = [
            'title',
            'cue',
            'craving',
            'response',
            'reward',
            'value',
            'habit_num',
            'id',
        ]


class RoutineSerializer(serializers.ModelSerializer):
    habits = HabitSerializer(many=True)

    class Meta:
        model = Routine
        fields = [
            'title',
            'habits',
            'ordered',
            'routine_num',
            'id',
        ]
