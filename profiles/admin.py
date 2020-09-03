from django.contrib import admin
from .models import Profile, Notification, ProfileBadge, ProfileHistorySegment

# class ProfileAdmin(admin.ModelAdmin):

#     # fieldsets = [
#     #     (None, {'fields': (
#     #         'user',
#     #         'get_first_name',
#     #         # 'get_last_name',
#     #         # 'get_email',
#     #         'location',
#     #         'bio',
#     #         'friends',
#     #         'pending_friends',
#     #     )}),
#     #     ('Advanced options', {'fields': (
#     #         # 'get_username',
#     #         # 'get_password',
#     #     ), 'classes': ('collapse',)})
#     # ]
#     list_display = [
#         'user',
#         'get_first_name',
#         'location',
#         'bio',
#         'friends',
#         'pending_friends',
#     ]

#     class Meta:
#         model = Profile
    
#     # def __str__(self):
#     #     return self.user.username
    
#     # def get_queryset(self, request):
#     #     return super(ProfileAdmin, self).get_queryset(request).select_related('user')
    
#     def get_first_name(self, obj):
#         return obj.user.first_name
#     # get_first_name.admin_order_field  = 'user__first_name'
    
#     # def get_last_name(self, obj):
#     #     return obj.user.last_name
    
#     # def get_email(self, obj):
#     #     return obj.user.email
    
#     # def get_username(self, obj):
#     #     return obj.user.username
    
#     # def get_password(self, obj):
#     #     return obj.user.password
    
    

admin.site.register(Profile)
admin.site.register(Notification)
admin.site.register(ProfileBadge)
admin.site.register(ProfileHistorySegment)