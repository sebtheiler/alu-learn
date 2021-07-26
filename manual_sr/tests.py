import datetime as dt

from django.contrib.auth import get_user_model
from utils import BLANK_SLATE_ELEMENT
from utils import ImprovedTestCase

from .api import views as api_views
from .models import ManualSRTask

User = get_user_model()


class ManualSRTestClass(ImprovedTestCase):
    def create_task(self, title: str) -> ManualSRTask:
        task, _ = ManualSRTask.objects.get_or_create(
            title=title,
            description=BLANK_SLATE_ELEMENT,
            user=self.user.profile,
        )

        return task

    def test_task_create_api(self):
        url_path = '/api/manual-sr/create/'

        # Attempt to create task without a title
        response = self.post_response(url_path, api_views.manual_sr_create_view)
        self.assertEqual(response.status_code, 400)

        # Create task
        response = self.post_response(url_path, api_views.manual_sr_create_view,
            {'title': 'My Task'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data['id'], int)
    
    def test_task_list_api(self):
        url_path = '/api/manual-sr/list/'
        
        # Get tasks (but none exist)
        response = self.get_response(url_path, api_views.manual_sr_list_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], [])
        self.assertEqual(response.data['count'], 0)
        self.assertIsNone(response.data['next'])
        self.assertIsNone(response.data['previous'])

        # Create task
        task = self.create_task('New Task')

        # Get tasks
        response = self.get_response(url_path, api_views.manual_sr_list_view)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['id'], task.pk)
        self.assertEqual(response.data['count'], 1)
        self.assertIsNone(response.data['next'])
        self.assertIsNone(response.data['previous'])

    def test_task_update_api(self):
        # Create task
        task = self.create_task('Task to Update')
        url_path = f'/api/manual-sr/update/{task.pk}/'

        # Check default stats
        self.assertEqual(task.learning_status, 'UNSEEN')
        self.assertEqual(task.steps_index, 0)
        self.assertEqual(task.ease, 250)
        self.assertEqual(task.next_review, dt.date.today())
        self.assertEqual(task.interval, 0)

        # "Update" without changing anything
        response = self.post_response(url_path, api_views.manual_sr_update_view, kwargs={'manual_sr_id': task.pk})
        self.assertEqual(task.learning_status, 'UNSEEN')
        self.assertEqual(task.steps_index, 0)
        self.assertEqual(task.ease, 250)
        self.assertEqual(task.next_review, dt.date.today())
        self.assertEqual(task.interval, 0)

        # Update task
        response = self.post_response(url_path, api_views.manual_sr_update_view, {
            'learning_status': 'LEARNING',
            'steps_index': 1,
            'ease': 265,
            'next_review': '2021-02-01',
            'interval': 7,
        }, kwargs={'manual_sr_id': task.pk})
        task = ManualSRTask.objects.get(pk=task.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(task.learning_status, 'LEARNING')
        self.assertEqual(task.steps_index, 1)
        self.assertEqual(task.ease, 265)
        self.assertEqual(task.next_review, dt.date(2021, 2, 1))
        self.assertEqual(task.interval, 7)
    
    def test_task_edit_api(self):
        # Create task
        task = self.create_task('Task to Edit')
        self.assertEqual(task.description, BLANK_SLATE_ELEMENT)
        self.assertEqual(task.title, 'Task to Edit')

        url_path = f'/api/manual-sr/edit/{task.pk}/'

        # "Edit" task without changing anything
        response = self.post_response(url_path, api_views.manual_sr_edit_view, kwargs={'manual_sr_id': task.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(task.description, BLANK_SLATE_ELEMENT)
        self.assertEqual(task.title, 'Task to Edit')

        # Edit task TODO:
        # new_description = [create_slate_element('Description'), create_slate_element('line 2')]
        # print('??', new_description)
        # response = self.post_response(url_path, api_views.manual_sr_edit_view, {
        #     'new_title': 'Edited Task',
        #     'new_description': new_description,
        # }, kwargs={'manual_sr_id': task.pk})
        # task = ManualSRTask.objects.get(pk=task.pk)
        # self.assertEqual(response.status_code, 200)
        # print(task.description, type(task.description))
        # self.assertEqual(task.description, new_description)
        # self.assertEqual(task.title, 'Task to Edit')

    def test_task_delete_api(self):
        # Create task
        task = self.create_task('Task to Edit')
        self.assertTrue(ManualSRTask.objects.filter(pk=task.id).exists())

        url_path = f'/api/manual-sr/delete/'

        # Attempt to delete as non-auth user
        user = User.objects.create(
            username='abc123',
            password='password',
        )
        response = self.post_response(url_path, api_views.manual_sr_delete_view,
            {'manual_sr_id': task.pk}, user=user,
        )
        self.assertEqual(response.status_code, 404)
        self.assertTrue(ManualSRTask.objects.filter(pk=task.id).exists())

        # Delete Task
        response = self.post_response(url_path, api_views.manual_sr_delete_view,
            {'manual_sr_id': task.pk},
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(ManualSRTask.objects.filter(pk=task.id).exists())

        # Attempt to delete non-existant task
        response = self.post_response(url_path, api_views.manual_sr_delete_view,
            {'manual_sr_id': task.pk},
        )
        self.assertEqual(response.status_code, 404)
        self.assertFalse(ManualSRTask.objects.filter(pk=task.id).exists())
