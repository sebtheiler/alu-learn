from django.shortcuts import render, redirect

# Render the home-page view
def notes_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'notes/home.html', status=200)


# Render the editor view
def notes_editor_view(request, note_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'notes/editor.html', status=200, context={'note_id': note_id})

# Shows a note's contents without the ability to edit
def notes_viewer_view(request, note_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'notes/viewer.html', status=200, context={'note_id': note_id})