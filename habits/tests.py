from utils.test_utils import ImprovedTestCase
from .api import views as api_views
from profiles.models import Profile
from .models import Habit, Routine


class HabitTestCase(ImprovedTestCase):
    def create_routine(
        self,
        title: str,
        user: Profile = None,
        num_habits: int = 0,
        ordered: bool = False,
    ) -> Routine:
        routine = Routine.objects.create(
            user=user or self.user.profile,
            title=title,
            ordered=ordered,
        )

        for i in range(num_habits):
            Habit.objects.create(
                title=f'Habit #{i + 1}',
                cue=f'Cue #{i + 1}',
                craving=f'Craving #{i + 1}',
                response=f'Response #{i + 1}',
                reward=f'Reward #{i + 1}',
                value='POSITIVE' if i % 2 == 0 else 'NEGATIVE',
                routine=routine,
            )

        return routine

    def test_routine_create(self):
        api_path = '/api/habits/routines/create/'

        self.assertEqual(Routine.objects.count(), 0)
        data = {
            'title': 'Created Routine',
            'ordered': True,
        }
        response = self.post_response(api_path, api_views.routine_create, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Routine.objects.count(), 1)

        routine = Routine.objects.first()
        self.assertEqual(routine.title, data['title'])
        self.assertEqual(routine.ordered, data['ordered'])

    def test_routine_list(self):
        api_path = '/api/habits/routines/'

        response = self.get_response(api_path, api_views.routine_list)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        # Create random habits and routines
        num_habits = 5
        num_routines = 2
        for i in range(num_routines):
            self.create_routine(f'Routine #{i + 1}', num_habits=num_habits)
        self.assertEqual(Routine.objects.count(), num_routines)
        self.assertEqual(Habit.objects.count(), num_habits * num_routines)

        response = self.get_response(api_path, api_views.routine_list)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), num_routines)

        # Check that the returned routine and the real routine are identical
        real_routines = Routine.objects.all()
        for data_routine, real_routine in zip(response.data, real_routines):
            self.assertEqual(data_routine['title'], real_routine.title)
            self.assertEqual(data_routine['ordered'], real_routine.ordered)
            self.assertEqual(data_routine['id'], real_routine.pk)

            for data_habit, real_habit in zip(data_routine['habits'], real_routine.habits.all()):
                self.assertEqual(data_habit['title'], real_habit.title)
                self.assertEqual(data_habit['cue'], real_habit.cue)
                self.assertEqual(data_habit['craving'], real_habit.craving)
                self.assertEqual(data_habit['response'], real_habit.response)
                self.assertEqual(data_habit['reward'], real_habit.reward)
                self.assertEqual(data_habit['value'], real_habit.value)

    def test_routine_edit(self):
        routine = self.create_routine('Routine to Edit', num_habits=5)
        api_path = f'/api/habits/routines/edit/{routine.pk}'

        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 5)
        data = {
            'new_title': 'Edited Routine',
            'new_ordered': False,
        }
        response = self.post_response(api_path, api_views.routine_edit, data, kwargs={
            'routine_id': routine.pk
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 5)

        routine.refresh_from_db()
        self.assertEqual(routine.title, data['new_title'])
        self.assertEqual(routine.ordered, data['new_ordered'])

    def test_routine_delete(self):
        routine = self.create_routine('Routine to Delete', num_habits=5)
        api_path = f'/api/habits/routines/{routine.pk}/delete/'
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 5)

        response = self.post_response(api_path, api_views.routine_delete, kwargs={
            'routine_id': routine.pk
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 0)
        self.assertEqual(Habit.objects.count(), 0)

    def test_habit_create(self):
        routine = self.create_routine('Routine to create a habit in')
        api_path = f'/api/habits/routines/{routine.pk}/habits/create/'
        kwargs = {'routine_id': routine.pk}

        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 0)
        data = {
            'title': 'Created Habit',
            'cue': 'Cue',
            'craving': 'Craving',
            'response': 'Response',
            'reward': 'Reward',
            'value': 'POSITIVE',
        }
        response = self.post_response(api_path, api_views.habit_create, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)

        habit = Habit.objects.first()
        self.assertEqual(habit.routine, routine)
        self.assertEqual(habit.title, data['title'])
        self.assertEqual(habit.cue, data['cue'])
        self.assertEqual(habit.craving, data['craving'])
        self.assertEqual(habit.response, data['response'])
        self.assertEqual(habit.reward, data['reward'])
        self.assertEqual(habit.value, data['value'])

    def test_habit_edit(self):
        routine = self.create_routine('Routine With Habit to Edit', num_habits=1)
        habit = routine.habits.first()
        api_path = f'/api/habits/routines/{routine.pk}/habits/edit/{habit.pk}'
        kwargs = {'routine_id': routine.pk, 'habit_id': habit.pk}

        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)
        data = {
            'new_title': 'Edited Habit',
            'new_cue': 'wake up',
            'new_craving': 'want to look at internet',
            'new_response': 'browse internet',
            'new_reward': 'feel good by seeing dank memes',
            'new_value': 'NEGATIVE',
        }
        response = self.post_response(api_path, api_views.habit_edit, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)

        habit.refresh_from_db()
        self.assertEqual(habit.title, data['new_title'])
        self.assertEqual(habit.cue, data['new_cue'])
        self.assertEqual(habit.craving, data['new_craving'])
        self.assertEqual(habit.response, data['new_response'])
        self.assertEqual(habit.reward, data['new_reward'])
        self.assertEqual(habit.value, data['new_value'])

    def test_habit_delete(self):
        routine = self.create_routine('Routine With Habit to Delete', num_habits=1)
        habit = routine.habits.first()
        api_path = f'/api/habits/routines/{routine.pk}/habits/delete/{habit.pk}'
        kwargs = {'routine_id': routine.pk, 'habit_id': habit.pk}

        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)
        response = self.post_response(api_path, api_views.habit_delete, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 0)
