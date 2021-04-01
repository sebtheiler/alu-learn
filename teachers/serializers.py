from datetime import timedelta
from django.utils import timezone
from profiles.models import Profile
from rest_framework import serializers
from decks.serializers import SharedDeckSerializer
from .models import Assignment, Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    deck = SharedDeckSerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            'title',
            'code',
            'deck',
            'id',
        ]


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.SerializerMethodField(read_only=True)
    today_stats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'current_streak',
            'today_stats',
            'id',
        ]

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_today_stats(self, obj):
        last_history = obj.history.order_by('date').last()
        today = timezone.now()
        if tz := self.context.get('tz'):
            today -= timedelta(minutes=int(tz))

        if last_history is None:
            actually_today = False
        else:
            actually_today = last_history.date == today.date()

        return {
            'cards_done_today': last_history.cards_done if actually_today else 0,
            'time_spent_today': last_history.time_spent if actually_today else 0,
        }


class AssignmentSerializer(serializers.ModelSerializer):
    percent_complete = serializers.SerializerMethodField(read_only=True)
    study_session_manager = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'title',
            'classroom',
            'tag_query',
            'due_date',
            'percent_complete',
            'study_session_manager',
            'id',
        ]

    def get_percent_complete(self, obj):
        if not self.context.get('calc_percent_complete'):
            return None

        return obj.calc_percent_complete(self.context['request'].user)

    def get_study_session_manager(self, obj):
        if not self.context.get('get_study_session_manager'):
            return None

        return obj.get_study_session_manager(self.context['request'].user)


class ClassroomAssignmentsSerializer(ClassroomSerializer):
    deck = SharedDeckSerializer(read_only=True)
    assignments = AssignmentSerializer(read_only=True, many=True)

    class Meta:
        model = Classroom
        fields = ClassroomSerializer.Meta.fields + [
            'assignments',
        ]
