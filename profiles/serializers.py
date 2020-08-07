from django.conf import settings
from rest_framework import serializers

from .models import Profile


class PublicProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField(read_only=True)
    last_name = serializers.SerializerMethodField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)
    friend_count = serializers.SerializerMethodField(read_only=True)
    is_friend = serializers.SerializerMethodField(read_only=True)

    class Meta:
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
        ]

    def get_is_friend(self, obj):
        request = self.context.get('request')
        is_following = request.user in obj.friends.all() if request else None
        return is_following

    def get_first_name(self, obj):
        return obj.user.first_name
    
    def get_last_name(self, obj):
        return obj.user.last_name
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_friend_count(self, obj):
        return obj.user.friends.count()