from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import json
from ..models import Note, FreeformNote, CornellNote, CornellNoteSection
from ..serializers import FreeformNoteSerializer, NoteSerializer, CornellNoteSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_create_api_view(request, *args, **kwargs):
    """
    Creates a new note - POST

    Required information:
        `title`: (Data) Title of the new note
        `version`: (Data) Type of note to create. Either: 'STND' or 'CORN'

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
    if version == 'STND':
        # Create standard note object
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
    elif version == 'CORN':
        # Create Cornell note object/
        note = CornellNote.objects.create(
            user=request.user.profile,
            title=title,
            summary=
[
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Summary..."
      }
    ]
  }
]
        )
        return Response(CornellNoteSerializer(note).data, status=201)
    elif version == 'FREE':
        # Create Holistic note object
        pass
    else:
        return Response({'message': 'Invalid note type'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def note_detail_api_view(request, note_id, *args, **kwargs):
    """
    Gets detail information about a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
    """
    try:
        note = FreeformNote.objects.get(pk=note_id, user=request.user.profile)
        return Response(FreeformNoteSerializer(note).data, status=200)
    except ObjectDoesNotExist:
        try:
            note = CornellNote.objects.get(pk=note_id, user=request.user.profile)
            return Response(CornellNoteSerializer(note).data, status=200)
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
            If the note is freeform, then this is one object with the new rich JSON content
            If the note is cornell, this should be a list of sections with cue and content attributes
    """
    try:
        note = FreeformNote.objects.get(pk=note_id, user=request.user.profile)
        content = request.data.get('new_content', note.content)
        note.content = content if isinstance(content, dict) else json.loads(content)
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
        try:
            note = CornellNote.objects.get(pk=note_id, user=request.user.profile)

            content = request.data.get('new_content')
            content = content if isinstance(content, dict) else json.loads(content)
            if content is not None:
                # Update summary
                note.summary = content['summary'] if content['summary'] else note.summary

                # Update sections
                sections = note.sections.all()
                for i, new_section in enumerate(content['sections']):
                    try:
                        # Update current section
                        current_section = sections.get(section_number=i)
                        old_cue, new_cue, = current_section.cue, new_section['cue']
                        old_content, new_content, = current_section.content, new_section['content']

                        if old_cue != new_cue or old_content != new_content:
                            current_section.cue = new_cue
                            current_section.content = new_content
                            current_section.save()
                    except ObjectDoesNotExist:
                        # Create new section
                        CornellNoteSection.objects.create(
                            parent_note=note,
                            cue=new_section['cue'],
                            content=new_section['content'],
                            section_number=i,
                        )

                # Delete extra sections
                num_sections = sections.count()
                if num_sections > len(content['sections']):
                    sections.filter(pk__in=
                        sections[num_sections - (num_sections - len(content['sections'])):]
                    .values_list('pk')).delete()

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
            return Response(CornellNoteSerializer(note).data, status=200)
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
        Note.objects.get(pk=note_id, user=request.user.profile).delete()
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
