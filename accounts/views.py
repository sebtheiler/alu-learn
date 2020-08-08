from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm


# Use built-in form for logging user in
def login_view(request, *args, **kwargs):
    form = AuthenticationForm(request, data=request.POST or None)

    if form.is_valid():
        # If the form submits successfully, login the user and
        # redirect them to the homepage
        user_ = form.get_user()
        login(request, user_)
        return redirect('/')

    context = {
        'form': form,
        'btn_label': 'Login',
        'title': 'Login',
    }
    return render(request, 'accounts/auth.html', context)


# Form for logging out the user
def logout_view(request, *args, **kwargs):
    if request.method == 'POST':
        # On button click, logout the user and redirect them
        # to the login page
        logout(request)
        return redirect('/login')

    context = {
        'form': None,
        'description': 'Are you sure you want to log out?',
        'btn_label': 'Click to Confirm',
        'title': 'Logout',
    }
    return render(request, 'accounts/auth.html', context)


# Use built-in form for registering user
def register_view(request, *args, **kwargs):
    form = UserCreationForm(request.POST or None)

    if form.is_valid():
        # On successful form submit, save the user into the database
        # and log them in
        # TODO: send confirmation email
        user = form.save(commit=True)
        user.set_password(form.cleaned_data.get('password1'))
        login(request, user)
        return redirect('/login')

    context = {
        'form': form,
        'btn_label': 'Register',
        'title': 'Register',
    }
    return render(request, 'accounts/auth.html', context)