from datetime import timedelta
from django.utils import timezone
from profiles.models import Profile
from rest_framework import serializers
from profiles.serializers import MinifiedProfileSerializer
from decks.serializers import SharedDeckSerializer
from .models import Classroom


class ClassroomSerializer(serializers.ModelSerializer):
    teacher = MinifiedProfileSerializer(read_only=True)
    deck = SharedDeckSerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            'title',
            'code',
            'teacher',
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
            # 'streak',
            'current_streak',
            'today_stats',
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
        actually_today = last_history.date == today.date()

        return {
            'cards_done_today': last_history.cards_done if actually_today else 0,
            'time_spent_today': last_history.time_spent if actually_today else 0,
        }
