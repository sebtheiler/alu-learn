from django.http.response import Http404
from django.shortcuts import render, redirect
from .models import Note
from django.http import Http404

# Render the home-page view
def notes_home_view(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'notes/home.html', status=200)


def notes_redirect_view(viewing):
    def notes_editor_redirect_view(request, note_id, *args, **kwargs):
        # TODO: redirect to most recently requested page
        view_or_edit = 'view' if viewing else 'edit'
        return redirect(f'/notes/{view_or_edit}/{note_id}/page/1/')

    return notes_editor_redirect_view


# Render the editor view
def notes_view(viewing):
    def notes_editor_view(request, note_id, page_number, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/')
        elif not request.user.is_confirmed:
            return redirect('/confirm-email/')
        
        try:
            note = Note.objects.get(pk=note_id, user=request.user.profile)
        except Note.DoesNotExist:
            raise Http404('Note does not exist')

        return render(request, 'notes/notes.html', status=200, context={
            'note_id': note_id,
            'note_title': note.title,
            'page_number': page_number,
            'is_viewing': viewing,
        })

    return notes_editor_view

# Shows a auto-reading platform for creating flashcards easily
def notes_create_flashcard_view(request, note_id, page_number, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect('/')
    elif not request.user.is_confirmed:
        return redirect('/confirm-email/')
    return render(request, 'notes/flashcard-creator.html', status=200, context={'note_id': note_id, 'page_num': page_number})