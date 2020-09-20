from django.conf import settings
from rest_framework import serializers

from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment, ProfileSettings


class ProfileSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileSettings
        fields = [
            'disable_all_tooltips',
            'id',
        ]


class ProfileBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileBadge
        fields = [
            'chosen',
            'identifier',
            'id',
        ]


class PublicProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.SerializerMethodField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)
    email = serializers.SerializerMethodField(read_only=True)
    friend_count = serializers.SerializerMethodField(read_only=True)
    is_friend = serializers.SerializerMethodField(read_only=True)
    you_are_pending = serializers.SerializerMethodField(read_only=True)
    badges = ProfileBadgeSerializer(read_only=True, many=True)
    settings = ProfileSettingsSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'username',
            'email',
            'id',
            'bio',
            'location',
            'friend_count',
            'is_friend',
            'you_are_pending',
            'settings',
            'badges',
            'total_thanks_recieved',
            'longest_streak',
            'current_streak',
        ]

    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        if request.user.is_anonymous:
            return False
        is_friend = request.user in obj.friends.all()
        return is_friend

    def get_you_are_pending(self, obj):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return None
        is_pending = request.user in obj.pending_friends.all()
        return is_pending

    def get_first_name(self, obj):
        return obj.user.first_name
    
    def get_last_name(self, obj):
        return obj.user.last_name
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_friend_count(self, obj):
        return obj.user.friends.count()
    
    def get_email(self, obj):
        return obj.user.email


class MinifiedProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.SerializerMethodField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'username',
        ]
    
    def get_first_name(self, obj):
        if isinstance(obj, Profile):
            return obj.user.first_name
        else:
            return obj.first_name
    
    def get_last_name(self, obj):
        if isinstance(obj, Profile):
            return obj.user.last_name
        else:
            return obj.last_name

    def get_username(self, obj):
        if isinstance(obj, Profile):
            return obj.user.username
        else:
            return obj.username


class NotificationSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'title',
            'description',
            'read',
            'category',
            'username',
            'timestamp',
            'id',
        ]
    
    def get_username(self, obj):
        return obj.profile.user.username


class HistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileHistorySegment
        fields = [
            'date',
            'cards_done',
            'id',
        ]