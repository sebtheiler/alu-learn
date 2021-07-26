from django.http import Http404
from django.shortcuts import render, redirect
from .models import Note
from utils import permissions


def notes_redirect_view(viewing):
    def notes_editor_redirect_view(request, note_id, *args, **kwargs):
        view_or_edit = 'view' if viewing else 'edit'
        return redirect(f'/notes/{view_or_edit}/{note_id}/page/1/')

    return notes_editor_redirect_view


# Render the editor view
def notes_view(viewing):
    @permissions()
    def notes_editor_view(request, note_id, page_number, *args, **kwargs):
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
