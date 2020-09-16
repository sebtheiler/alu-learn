from django.shortcuts import render, redirect

# Render the home-page view
def notes_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'notes/home.html', status=200)


# Render the editor view
def notes_editor_view(request, note_id, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'notes/editor.html', status=200, context={'note_id': note_id})