from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Note, FreeformNote
from ..serializers import FreeformNoteSerializer, NoteSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_create_api_view(request, *args, **kwargs):
    """
    Creates a new note - POST

    Required information:
        `title`: (Data) Title of the new note
        `version`: (Data) Type of note to create. Either: 'freeform' or 'cornell'

    Possible errors:
        Unspecified title/version: 400, You must specify a title and version
        Title already exists for the current user: 400, Title is taken
    """
    # Get data
    title = request.data.get('title')
    version = request.data.get('version')
    if None in (title, version):
        return Response({'message': 'You must specify a title and version'}, status=400)
    
    # Check if the user already has other notes with the same name
    try:
        Note.objects.get(user=request.user.profile, title=title)
        return Response({'message': 'Title is taken'}, status=400)
    except ObjectDoesNotExist:
        pass
    
    # Create note object
    if version == 'freeform':
        note = FreeformNote.objects.create(
            user=request.user.profile,
            title=title,
            content=
[
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Take notes here..."
      }
    ]
  }
]
        )
        return Response(FreeformNoteSerializer(note).data, status=201)
    else:
        pass


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def note_detail_api_view(request, note_id, *args, **kwargs):
    """
    Gets detail information about a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
    """
    try:
        note = FreeformNote.objects.get(pk=note_id)
        return Response(FreeformNoteSerializer(note).data, status=200)
    except ObjectDoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_update_api_view(request, note_id, *args, **kwargs):
    """
    Updates a note's content - POST

    Required information:
        `note_id`: (URL) ID of the note to update
        `new_title`: (Data): New title of the note
        `new_content`: (Data):
            If the note is freeform, then this is one object
            If the note is cornell, this should be ...
    """
    try:
        note = FreeformNote.objects.get(pk=note_id)
        note.content = request.data.get('new_content', note.content)
        title = request.data.get('new_title')
        if title:
            # Check if title is taken
            try:
                Note.objects.get(user=request.user.profile, title=title)
                return Response({'message': 'Title is taken'}, status=400)
            except ObjectDoesNotExist:
                pass
            note.title = title

        note.save()
        return Response(FreeformNoteSerializer(note).data, status=200)
    except ObjectDoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_delete_api_view(request, note_id, *args, **kwargs):
    """
    Gets detail information about a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
    """
    try:
        Note.objects.get(pk=note_id).delete()
        return Response({'message': 'Deleted note successfully'}, status=200)
    except ObjectDoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notes_api_view(request, *args, **kwargs):
    """
    Gets all of the current user's notes - GET
    """
    return Response(NoteSerializer(request.user.profile.notes, many=True).data, status=200)
