import json
from utils import BLANK_SLATE_ELEMENT, create_slate_element

from django.db.models.expressions import F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (CornellNotePage, CornellNotePageSection,
                      FreeformNotePage, Note, NotePage)
from ..serializers import (CornellNotePageSerializer,
                           FreeformNotePageSerializer, FullNoteSerializer,
                           NoteSerializer)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_create_api_view(request, *args, **kwargs):
    """
    Creates a new note - POST

    Required information:
        `title`: (Data) Title of the new note

    Possible errors:
        Unspecified title/version: 400, You must specify a title and version
        Title already exists for the current user: 400, Title is taken
    """
    # Get data
    title = request.data.get('title')
    if title is None:
        return Response({'message': 'You must specify a title and version'}, status=400)

    # Check if the user already has other notes with the same name
    try:
        Note.objects.get(user=request.user.profile, title=title)
        return Response({'message': 'Title is taken'}, status=400)
    except Note.DoesNotExist:
        pass

    # Create note object
    note = Note.objects.create(
        title=title,
        user=request.user.profile,
    )

    return Response(NoteSerializer(note).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_page_create_api_view(request, *args, **kwargs):
    """
    Make a single note page - POST

    Required information
        `note_id`: (Data) ID of the note to create a new page in
        `title`: (Data) Title of the new note page
        `version`: (Data) What type of note page this should be
    """
    note_id = request.data.get('note_id')
    version = request.data.get('version')
    title = request.data.get('title')
    page_position = request.data.get('page_position')
    if None in (note_id, version, title):
        return Response({'message': 'You must specify a note id, version, and title'}, status=400)

    try:
        note = Note.objects.get(pk=note_id, user=request.user.profile)
    except Note.DoesNotExist:
        return Response({'message': 'The specified note does not exist / you are unauthorized'}, status=400)

    if page_position == 'END' or page_position is None:
        # Get the maximum note page number
        max_page_num_obj = NotePage.objects.filter(note=note).order_by('-page_number').first()
        note_page_number = max_page_num_obj.page_number + 1 if max_page_num_obj else 1
    elif page_position == 'FRONT':
        # Shift all other pages up by one, and insert this at the beginning
        NotePage.objects.filter(note=note).update(
            page_number=F('page_number') + 1
        )
        note_page_number = 1
    elif isinstance(page_position, int):
        # Get a custom page position, shift all pages after up
        note_pages = NotePage.objects.filter(note=note)
        note_pages.filter(page_number__gte=page_position).update(
            page_number=F('page_number') + 1
        )
        note_page_number = min(page_position, note_pages.count() + 1)
    else:
        return Response({'message': 'Unrecognized page position'}, status=400)

    if version == 'STND':
        # Create standard note object
        note_page = FreeformNotePage.objects.create(
            note=note,
            title=title,
            page_number=note_page_number,
            content=BLANK_SLATE_ELEMENT,
        )
        return Response(FreeformNotePageSerializer(note_page).data, status=201)
    elif version == 'CORN':
        # Create Cornell note object/
        note_page = CornellNotePage.objects.create(
            note=note,
            title=title,
            page_number=note_page_number,
            summary=create_slate_element('summary'),
        )
        return Response(CornellNotePageSerializer(note_page).data, status=201)
    else:
        return Response({'message': 'Invalid note type'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def note_detail_api_view(request, note_id, *args, **kwargs):
    """
    Gets detail information about a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
        `getPages`: (GET) If True, returns information on the note pages, disabled to save bandwith
    """
    try:
        note = Note.objects.get(pk=note_id, user=request.user.profile)
        get_pages = request.GET.get('getPages')
        if get_pages and get_pages.lower() == 'true':
            return Response(FullNoteSerializer(note).data, status=200)
        return Response(NoteSerializer(note).data, status=200)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def note_page_detail_api_view(request, note_id, page_number, *args, **kwargs):
    """
    Gets detail information about a note page, in a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
    """
    try:
        note = FreeformNotePage.objects.get(
            note__pk=note_id,
            page_number=page_number,
            note__user=request.user.profile,
        )
        return Response(FreeformNotePageSerializer(note).data, status=200)
    except FreeformNotePage.DoesNotExist:
        try:
            note = CornellNotePage.objects.get(
                note__pk=note_id,
                page_number=page_number,
                note__user=request.user.profile,
            )
            return Response(CornellNotePageSerializer(note).data, status=200)
        except CornellNotePage.DoesNotExist:
            return Response({'message': 'Note not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_update_api_view(request, note_id, *args, **kwargs):
    """
    Update a note's title and other metadata - POST

    Required information:
        `note_id`: (URL) Id of the note object to update
        `title`: (Data) New title of the note
    """
    try:
        note = Note.objects.get(pk=note_id, user=request.user.profile)
    except Note.DoesNotExist:
        return Response({'message': 'Note not found / you are unauthorized'}, status=400)

    note.title = request.data.get('title', note.title)
    note.save()

    return Response(NoteSerializer(note).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_page_update_api_view(request, note_id, page_id, *args, **kwargs):
    """
    Updates a note page's content - POST

    Required information:
        `note_id`: (URL) ID of the note to update
        `new_content`: (Data):
            `new_title`: (Data): New title of the note
            If the note is freeform, then this is one object with the new rich JSON content
            If the note is cornell, this should be a list of sections with cue and content attributes
    """
    content = request.data.get('new_content')
    content = content if isinstance(content, dict) else json.loads(content)

    def update_note_title(note_page, page_title, note_title):
        if page_title:
            note_page.title = page_title

        if note_title:
            note_page.note.title = note_title
            note_page.note.save()

    try:
        note = FreeformNotePage.objects.get(
            note__pk=note_id,
            note__user=request.user.profile,
            pk=page_id,
        )

        note.content = content.get('content', note.content)
        update_note_title(note, content.get('page_title'), content.get('note_title'))

        note.save()
        return Response(FreeformNotePageSerializer(note).data, status=200)
    except FreeformNotePage.DoesNotExist:
        try:
            note = CornellNotePage.objects.get(
                note__pk=note_id,
                note__user=request.user.profile,
                pk=page_id,
            )

            # Update summary
            note.summary = content.get('summary', note.summary)

            # Update title
            update_note_title(note, content.get('page_title'), content.get('note_title'))

            # Update sections
            if content.get('sections'):
                sections = note.sections.all()
                for i, new_section in enumerate(content['sections']):
                    try:
                        # Update current section
                        current_section = sections.get(section_number=i)
                        old_cue, new_cue = current_section.cue, new_section['cue']
                        old_content, new_content = current_section.content, new_section['content']

                        if old_cue != new_cue or old_content != new_content:
                            current_section.cue = new_cue
                            current_section.content = new_content
                            current_section.save()
                    except CornellNotePageSection.DoesNotExist:
                        # Create new section
                        CornellNotePageSection.objects.create(
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

            note.save()
            return Response(CornellNotePageSerializer(note).data, status=200)
        except CornellNotePage.DoesNotExist:
            return Response({'message': f'Note {note_id}/{page_id} not found'}, status=404)


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
    except NotePage.DoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def note_page_delete_api_view(request, note_id, page_id, *args, **kwargs):
    """
    Gets detail information about a note object - GET

    Required information:
        `note_id`: (URL) ID of the note to return
        `page_id`: (URL) Id of the note page to delete
    """
    try:
        # Delete the note page object
        page_to_delete = NotePage.objects.get(
            note__pk=note_id,
            note__user=request.user.profile,
            pk=page_id,
        )
        page_to_delete.delete()

        # Decrease the page number of all pages that come after this page
        NotePage.objects.filter(
            note__pk=note_id,
            note__user=request.user.profile,
            page_number__gte=page_to_delete.page_number,
        ).update(page_number=F('page_number') - 1)

        return Response({'message': 'Deleted note successfully'}, status=200)
    except NotePage.DoesNotExist:
        return Response({'message': 'Note not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notes_api_view(request, *args, **kwargs):
    """
    Gets all of the current user's notes - GET
    """
    return Response(NoteSerializer(request.user.profile.notes, many=True).data, status=200)
