from .models import Profile
from .forms import ProfileForm
from django.http import Http404
from django.shortcuts import render, redirect


# Rendered when updating one's own profile
def profile_update_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    user = request.user
    my_profile = user.profile
    user_data = {
        'first_name': user.first_name,
        'last_name': user.last_name,
    }
    form = ProfileForm(request.POST or None, instance=my_profile, initial=user_data)
    if form.is_valid():
        profile_obj = form.save(commit=False)
        first_name = form.cleaned_data.get('first_name')
        last_name = form.cleaned_data.get('last_name')

        user.first_name = first_name
        user.last_name = last_name
        user.save()
        profile_obj.save()
    context = {
        'form': form,
        'btn_label': 'Save',
        'title': 'Update Profile',
    }
    return render(request, 'profiles/form.html', context)
    

# Renders when viewing a persons profile
def profile_detail_view(request, username, *args, **kwargs):
    profile_qs = Profile.objects.filter(user__username=username)
    if not profile_qs.exists():
        raise Http404()
    profile_obj = profile_qs.first()

    is_friend = None
    if request.user.is_authenticated:
        is_friend = request.user in profile_obj.friends.all()

    context = {
        'current_user_username': request.user.username,
        'username': username,
        'profile': profile_obj,
        'is_friend': is_friend,
    }
    return render(request, 'profiles/detail.html', context)


# Display a list of the user's notifications
def notifications_list_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'profiles/notifications.html', {'username': request.user.username})