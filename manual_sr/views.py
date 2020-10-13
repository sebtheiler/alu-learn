from django.shortcuts import render, redirect

# Create your views here.
def manual_sr_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'manual-sr/home.html', status=200)