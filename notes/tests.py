from django.contrib.auth import get_user_model
from utils import ImprovedTestCase, create_slate_element

from .api import views as api_views
from .models import (CornellNotePage, CornellNotePageSection, FreeformNotePage,
                     Note)

User = get_user_model()


class NoteTestCase(ImprovedTestCase):
    def create_note(self, title: str, num_pages=0, page_type=None) -> Note:
        note = Note.objects.create(
            title=title,
            user=self.user.profile,
        )

        for i in range(num_pages):
            if (
                not page_type or
                page_type == 'STND' or
                (isinstance(page_type, list) and page_type[i] == 'STND')
            ):
                FreeformNotePage.objects.create(
                    note=note,
                    title=f'Page - {i}',
                    page_number=i + 1,
                    content=create_slate_element(f'Content - {i}')
                )
            elif (
                page_type == 'CORN' or
                (isinstance(page_type, list) and page_type[i] == 'CORN')
            ):
                cornell_page = CornellNotePage.objects.create(
                    note=note,
                    title=f'Page - {i}',
                    page_number=i + 1,
                    summary=create_slate_element(f'Summary - {i}')
                )

                for j in range(3):
                    CornellNotePageSection.objects.create(
                        parent_note=cornell_page,
                        cue=create_slate_element(f'Cue - {j}'),
                        content=create_slate_element(f'Content - {j}'),
                        section_number=j,
                    )

        return note

    def test_note_create_api(self):
        api_path = '/api/notes/create/'
        api_view = api_views.note_create_api_view

        num_notes = Note.objects.filter(user=self.user.profile).count()
        response = self.post_response(api_path, api_view, {
            'title': 'My notes',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Note.objects.filter(user=self.user.profile).count(),
            num_notes + 1,
        )
        note = Note.objects.get(pk=response.data['id'])
        self.assertEqual(note.title, 'My notes')
        self.assertEqual(note.user, self.user.profile)

    def test_note_page_create_api(self):
        api_path = '/api/notes/create-page/'
        api_view = api_views.note_page_create_api_view
        note = self.create_note('Note to add a page in')

        response = self.post_response(api_path, api_view, {
            'note_id': note.pk,
            'title': 'My note page',
            'version': 'STND',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(note.pages.count(), 1)
        page = FreeformNotePage.objects.get(pk=response.data['id'])
        self.assertEqual(page.title, 'My note page')
        self.assertEqual(page.page_number, 1)

    def test_note_detail_api(self):
        note = self.create_note('Note to get detail', num_pages=3)
        api_path = f'/api/notes/detail/{note.pk}/'
        api_view = api_views.note_detail_api_view
        kwargs = {'note_id': note.pk}

        # Test as non-owner
        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)

        # Get note detail
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['title'], 'Note to get detail')
        try:
            Note.objects.get(pk=response.data['id'])
        except Note.DoesNotExist:
            self.fail('Invalid Note ID returned')

        # Get note detail (with pages)
        response = self.get_response(f'{api_path}?getPages=true', api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data['title'], 'Note to get detail')
        self.assertEqual(len(response.data['pages']), 3)
        for i, page in enumerate(response.data['pages']):
            self.assertEqual(page['title'], f'Page - {i}')
            self.assertRaises(KeyError, lambda: page['content'])

    def test_note_page_detail_api(self):
        note = self.create_note('Note to get page detail', num_pages=2, page_type=['STND', 'CORN'])
        api_path = f'/api/notes/page-detail/{note.pk}/1/'
        kwargs = {'note_id': note.pk, 'page_number': 1}
        api_view = api_views.note_page_detail_api_view

        # Test as non-owner
        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)

        # Test standard page
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {
            'content': create_slate_element('Content - 0'),
            'title': 'Page - 0',
            'page_number': 1,
            'note_page_type': 'STND',
            'id': note.pages.first().pk,
        })

        # Test cornell page
        api_path = f'/api/notes/page-detail/{note.pk}/2/'
        kwargs = {'note_id': note.pk, 'page_number': 2}

        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['summary'], create_slate_element('Summary - 1'))
        self.assertEqual(response.data['title'], 'Page - 1')
        self.assertEqual(response.data['page_number'], 2)
        self.assertEqual(response.data['note_page_type'], 'CORN')
        for i in range(3):
            self.assertEqual(
                response.data['sections'][i]['cue'],
                create_slate_element(f'Cue - {i}'),
            )
            self.assertEqual(
                response.data['sections'][i]['content'],
                create_slate_element(f'Content - {i}'),
            )

    def test_note_update_api(self):
        note = self.create_note('Note to update')
        api_path = f'/api/notes/update/{note.pk}/'
        api_view = api_views.note_update_api_view
        kwargs = {'note_id': note.pk}

        response = self.post_response(api_path, api_view, {
            'title': 'Updated note',
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        note = Note.objects.get(pk=response.data['id'])
        self.assertEqual(note.title, 'Updated note')

    def test_note_page_update_api(self):
        api_view = api_views.note_page_update_api_view

        # Test standard freeform page
        note = self.create_note('Note to update pages', num_pages=1)
        page = note.pages.first()
        api_path = f'/api/notes/page-update/{note.pk}/{page.pk}/'
        kwargs = {'note_id': note.pk, 'page_id': page.pk}
        response = self.post_response(api_path, api_view, {
            'new_content': {
                'page_title': 'Updated page',
                'note_title': 'Updated note title',
                'content': create_slate_element('Updated page content'),
            }
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        note = Note.objects.get(pk=note.pk)
        page = FreeformNotePage.objects.get(pk=response.data['id'])
        self.assertEqual(note.title, 'Updated note title')
        self.assertEqual(page.title, 'Updated page')
        self.assertEqual(page.content, create_slate_element('Updated page content'))

        # Test cornell
        note = self.create_note('Cornell note to update pages', num_pages=1, page_type='CORN')
        page = note.pages.first()
        api_path = f'/api/notes/page-update/{note.pk}/{page.pk}/'
        kwargs = {'note_id': note.pk, 'page_id': page.pk}
        response = self.post_response(api_path, api_view, {
            'new_content': {
                'page_title': 'Updated page',
                'note_title': 'Updated cornell note title',
                'summary': create_slate_element('Updated summary'),
                'sections': [
                    {
                        'cue': create_slate_element('Updated cue - 0'),
                        'content': create_slate_element('Updated content - 0'),
                    },
                ],
            },
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        note = Note.objects.get(pk=note.pk)
        page = CornellNotePage.objects.get(pk=response.data['id'])
        self.assertEqual(note.title, 'Updated cornell note title')
        self.assertEqual(page.title, 'Updated page')
        self.assertEqual(page.summary, create_slate_element('Updated summary'))
        self.assertEqual(page.sections.count(), 1)
        section1 = page.sections.first()
        self.assertEqual(section1.cue, create_slate_element('Updated cue - 0'))
        self.assertEqual(section1.content, create_slate_element('Updated content - 0'))

        response = self.post_response(api_path, api_view, {
            'new_content': {
                'sections': [
                    {
                        'cue': create_slate_element('Updated cue - 0'),
                        'content': create_slate_element('Updated content - 0'),
                    },
                    {
                        'cue': create_slate_element('Updated cue - 1'),
                        'content': create_slate_element('Updated content - 1'),
                    },
                ],
            },
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        note = Note.objects.get(pk=note.pk)
        page = CornellNotePage.objects.get(pk=response.data['id'])
        self.assertEqual(note.title, 'Updated cornell note title')
        self.assertEqual(page.title, 'Updated page')
        self.assertEqual(page.summary, create_slate_element('Updated summary'))
        self.assertEqual(page.sections.count(), 2)
        section1 = page.sections.first()
        section2 = page.sections.last()
        self.assertEqual(section1.cue, create_slate_element('Updated cue - 0'))
        self.assertEqual(section1.content, create_slate_element('Updated content - 0'))
        self.assertEqual(section2.cue, create_slate_element('Updated cue - 1'))
        self.assertEqual(section2.content, create_slate_element('Updated content - 1'))

    def test_note_delete_api(self):
        note = self.create_note('Note to delete')
        api_path = f'/api/notes/delete/{note.pk}'
        api_view = api_views.note_delete_api_view
        kwargs = {'note_id': note.pk}

        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertRaises(
            Note.DoesNotExist,
            lambda: Note.objects.get(pk=note.pk),
        )

    def test_note_page_delete_api(self):
        note = self.create_note('Note with page to delete', num_pages=1)
        page = note.pages.first()
        api_path = f'/api/notes/delete-page/{note.pk}/{page.pk}/'
        api_view = api_views.note_page_delete_api_view
        kwargs = {'note_id': note.pk, 'page_id': page.pk}

        response = self.post_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertRaises(
            FreeformNotePage.DoesNotExist,
            lambda: FreeformNotePage.objects.get(pk=page.pk),
        )
        try:
            note = Note.objects.get(pk=note.pk)
        except Note.DoesNotExist:
            self.fail('Deleted note, instead of just page')

    def test_user_note_list_api(self):
        api_path = '/api/notes/list/'
        api_view = api_views.user_notes_api_view

        # Test with no notes
        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)

        # Create notes and test again
        self.create_note('Note in list #1')
        self.create_note('Note in list #2')
        self.create_note('Note in list #3')

        response = self.get_response(api_path, api_view)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 3)
        for i, note in enumerate(response.data):
            self.assertEqual(note['title'], f'Note in list #{i + 1}')
