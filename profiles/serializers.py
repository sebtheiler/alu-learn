from django.conf import settings
from rest_framework import serializers

from .models import Profile, Notification, ProfileBadge


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
    friend_count = serializers.SerializerMethodField(read_only=True)
    is_friend = serializers.SerializerMethodField(read_only=True)
    you_are_pending = serializers.SerializerMethodField(read_only=True)
    badges = ProfileBadgeSerializer(read_only=True, many=True)

    class Meta:
        # Don't forget to update documentation in profiles/api/views.py!
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'username',
            'id',
            'bio',
            'location',
            'friend_count',
            'is_friend',
            'you_are_pending',
            'badges',
            'total_thanks_recieved',
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
        is_pending = request.user.profile in obj.pending_friends.all()
        return is_pending

    def get_first_name(self, obj):
        return obj.user.first_name
    
    def get_last_name(self, obj):
        return obj.user.last_name
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_friend_count(self, obj):
        return obj.user.friends.count()


class NotificationSerializer(serializers.ModelSerializer):
    profile = PublicProfileSerializer(read_only=True)
    title = serializers.SerializerMethodField(read_only=True)
    description = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'profile',
            'title',
            'description',
            'read',
            'category',
            'timestamp',
            'id',
        ]
    
    def get_title(self, obj):
        return obj.title
    
    
    def get_description(self, obj):
        return obj.description