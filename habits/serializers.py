from rest_framework import serializers
from .models import Habit, Routine, Todo


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
            'notes',
            'habit_num',
            'history',
            'id',
        ]
        read_only_fields = fields


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
        read_only_fields = fields


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = (
            'text',
            'id',
        )
        read_only_fields = fields
