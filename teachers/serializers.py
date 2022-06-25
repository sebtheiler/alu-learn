from datetime import timedelta

from django.utils import timezone
from profiles.models import Profile
from rest_framework import serializers
from sharing_system.serializers import SharedDeckSerializer
from skill_tree.serializers import SubSectionSerializer

from .models import Assignment, Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    shared_deck = SharedDeckSerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            'title',
            'code',
            'shared_deck',
            'id',
        ]


class StudentSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.SerializerMethodField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)
    today_stats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'username',
            'current_streak',
            'today_stats',
            'id',
        ]

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_username(self, obj):
        return obj.user.username

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
    sub_sections = serializers.SerializerMethodField(read_only=True)
    percent_complete = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'title',
            'classrooms',
            'sub_sections',
            'due_date',
            'essential_only',
            'percent_complete',
            'id',
        ]

    def get_percent_complete(self, obj):
        if not self.context.get('calc_percent_complete'):
            return None

        return obj.calc_percent_complete(self.context['request'].user)

    def get_sub_sections(self, obj):
        return SubSectionSerializer(
            obj.sub_sections.all(),
            many=True,
            context={'get_main_section': True},
        ).data


class ClassroomAssignmentsSerializer(ClassroomSerializer):
    # deck = SharedDeckSerializer(read_only=True)
    assignments = AssignmentSerializer(read_only=True, many=True)

    class Meta:
        model = Classroom
        fields = ClassroomSerializer.Meta.fields + [
            'assignments',
        ]
