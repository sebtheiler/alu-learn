import datetime as dt

from profiles.models import Profile, ProfileHistorySegment
from utils import ImprovedTestCase, SeleniumTestCase

from .api import views as api_views
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
            routine_num=Routine.get_routine_num(user or self.user.profile),
        )

        for i in range(num_habits):
            Habit.objects.create(
                title=f'Habit #{i + 1}',
                cue=f'Cue #{i + 1}',
                craving=f'Craving #{i + 1}',
                response=f'Response #{i + 1}',
                reward=f'Reward #{i + 1}',
                notes=f'Notes #{i + 1}',
                history=[{'date': '2013-01-01', 'done': True}],
                value='POSITIVE' if i % 2 == 0 else 'NEGATIVE',
                routine=routine,
                habit_num=i,
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
        self.assertEqual(routine.routine_num, 0)

        # Create another to test `routine_num` incrementing
        response = self.post_response(api_path, api_views.routine_create, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Routine.objects.count(), 2)

        routine = Routine.objects.last()
        self.assertEqual(routine.title, data['title'])
        self.assertEqual(routine.ordered, data['ordered'])
        self.assertEqual(routine.routine_num, 1)

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
            self.assertEqual(data_routine['routine_num'], real_routine.routine_num)
            self.assertEqual(data_routine['id'], real_routine.pk)

            for data_habit, real_habit in zip(data_routine['habits'], real_routine.habits.all()):
                self.assertEqual(data_habit['title'], real_habit.title)
                self.assertEqual(data_habit['cue'], real_habit.cue)
                self.assertEqual(data_habit['craving'], real_habit.craving)
                self.assertEqual(data_habit['response'], real_habit.response)
                self.assertEqual(data_habit['reward'], real_habit.reward)
                self.assertEqual(data_habit['value'], real_habit.value)
                self.assertEqual(data_habit['notes'], real_habit.notes)
                self.assertEqual(data_habit['history'], real_habit.history)
                self.assertEqual(data_habit['habit_num'], real_habit.habit_num)
                self.assertEqual(data_habit['id'], real_habit.id)

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
        other_routine = self.create_routine('Routine to Rearrange', num_habits=5)
        api_path = f'/api/habits/routines/{routine.pk}/delete/'
        self.assertEqual(Routine.objects.count(), 2)
        self.assertEqual(Habit.objects.count(), 10)
        self.assertEqual(routine.routine_num, 0)
        self.assertEqual(other_routine.routine_num, 1)

        response = self.post_response(api_path, api_views.routine_delete, kwargs={
            'routine_id': routine.pk
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 5)

        other_routine.refresh_from_db()
        self.assertEqual(other_routine.routine_num, 0)

    def test_routine_rearrange(self):
        routine1 = self.create_routine('Routine #1')
        routine2 = self.create_routine('Routine #2')
        routine3 = self.create_routine('Routine #3')
        self.assertEqual(routine1.routine_num, 0)
        self.assertEqual(routine2.routine_num, 1)
        self.assertEqual(routine3.routine_num, 2)

        def move_routine(direction, expected_orders, routine_id, should_fail=False):
            api_path = f'/api/habits/routines/rearrange/{routine_id}/'
            kwargs = {'routine_id': routine_id}
            response = self.post_response(api_path, api_views.routine_rearrange, {
                'direction': direction,
            }, kwargs=kwargs)
            self.assertEqual(response.status_code, 400 if should_fail else 200)

            routine1.refresh_from_db()
            routine2.refresh_from_db()
            routine3.refresh_from_db()
            if not should_fail:
                self.assertEqual(routine1.routine_num, expected_orders[0])
                self.assertEqual(routine2.routine_num, expected_orders[1])
                self.assertEqual(routine3.routine_num, expected_orders[2])

        move_routine('DOWN', [1, 0, 2], routine1.pk)
        move_routine('DOWN', [2, 0, 1], routine1.pk)
        move_routine('DOWN', [2, 0, 1], routine1.pk, should_fail=True)
        move_routine('DOWN', [2, 1, 0], routine2.pk)
        move_routine('DOWN', [1, 2, 0], routine2.pk)
        move_routine('UP', [0, 2, 1], routine1.pk)
        move_routine('UP', [0, 2, 1], routine1.pk, should_fail=True)
        move_routine('UP', [0, 1, 2], routine2.pk)

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
            'notes': 'Notes',
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
        self.assertEqual(habit.notes, data['notes'])
        self.assertEqual(habit.history, [])
        self.assertEqual(habit.value, data['value'])
        self.assertEqual(habit.habit_num, 0)

        # Create another to make sure `habit_num` increments
        response = self.post_response(api_path, api_views.habit_create, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 2)

        habit = Habit.objects.last()
        self.assertEqual(habit.habit_num, 1)

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
            'new_notes': 'what is this',
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
        self.assertEqual(habit.notes, data['new_notes'])
        self.assertEqual(habit.value, data['new_value'])

        # Test history action (since it's more complicated)
        data = {'history_action': {
            'action': 'INCREMENT',
            'utc_timezone_offset': 0,
        }}
        initial_hist_len = len(habit.history)
        initial_prof_hist_num = ProfileHistorySegment.objects.count()
        response = self.post_response(api_path, api_views.habit_edit, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)

        habit.refresh_from_db()
        self.assertEqual(initial_hist_len, len(habit.history) - 1)
        self.assertEqual(
            initial_prof_hist_num,
            ProfileHistorySegment.objects.count() - 1,
        )
        self.assertEqual(self.user.profile.has_done_work_today, True)

        latest_hist_seg = ProfileHistorySegment.objects.last()
        latest_history = habit.history[-1]
        date = dt.datetime.today().strftime('%Y-%m-%d')
        self.assertEqual(str(latest_hist_seg.date), date)
        self.assertEqual(latest_hist_seg.habits_done, 1)
        self.assertEqual(latest_history['date'], date)
        self.assertEqual(latest_history['done'], True)

        # Test undoing the history
        data = {'history_action': {
            'action': 'DECREMENT',
            'utc_timezone_offset': 0,
        }}
        response = self.post_response(api_path, api_views.habit_edit, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), 1)

        habit.refresh_from_db()
        self.assertEqual(initial_hist_len, len(habit.history))
        self.assertEqual(
            initial_prof_hist_num,
            ProfileHistorySegment.objects.count() - 1,
        )
        self.assertEqual(self.user.profile.has_done_work_today, True)

        latest_hist_seg.refresh_from_db()
        latest_history = habit.history[-1]
        date = dt.datetime.today().strftime('%Y-%m-%d')
        self.assertEqual(str(latest_hist_seg.date), date)
        self.assertEqual(latest_hist_seg.habits_done, 0)
        self.assertNotEqual(latest_history['date'], date)

    def test_habit_delete(self):
        num_habits = 5
        routine = self.create_routine('Routine With Habit to Delete', num_habits=num_habits)
        habit = routine.habits.first()
        api_path = f'/api/habits/routines/{routine.pk}/habits/delete/{habit.pk}'
        kwargs = {'routine_id': routine.pk, 'habit_id': habit.pk}

        for i, habit in enumerate(routine.habits.all()):
            self.assertEqual(habit.habit_num, i)

        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), num_habits)
        response = self.post_response(api_path, api_views.habit_delete, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Routine.objects.count(), 1)
        self.assertEqual(Habit.objects.count(), num_habits - 1)

        # Make sure that all the other habits were rearranged
        for i, habit in enumerate(routine.habits.all()):
            self.assertEqual(habit.habit_num, i)

    def test_habit_rearrange(self):
        routine = self.create_routine('Routine', num_habits=3)
        habit1 = routine.habits.all()[0]
        habit2 = routine.habits.all()[1]
        habit3 = routine.habits.all()[2]
        self.assertEqual(habit1.habit_num, 0)
        self.assertEqual(habit2.habit_num, 1)
        self.assertEqual(habit3.habit_num, 2)

        def move_habit(direction, expected_orders, habit_id, should_fail=False):
            api_path = f'/api/habits/routines/{routine.id}/habits/{habit_id}/rearrange/'
            kwargs = {'routine_id': routine.id, 'habit_id': habit_id}
            response = self.post_response(api_path, api_views.habit_rearrange, {
                'direction': direction,
            }, kwargs=kwargs)
            self.assertEqual(response.status_code, 400 if should_fail else 200)

            habit1.refresh_from_db()
            habit2.refresh_from_db()
            habit3.refresh_from_db()
            if not should_fail:
                self.assertEqual(habit1.habit_num, expected_orders[0])
                self.assertEqual(habit2.habit_num, expected_orders[1])
                self.assertEqual(habit3.habit_num, expected_orders[2])

        move_habit('DOWN', [1, 0, 2], habit1.pk)
        move_habit('DOWN', [2, 0, 1], habit1.pk)
        move_habit('DOWN', [2, 0, 1], habit1.pk, should_fail=True)
        move_habit('DOWN', [2, 1, 0], habit2.pk)
        move_habit('DOWN', [1, 2, 0], habit2.pk)
        move_habit('UP', [0, 2, 1], habit1.pk)
        move_habit('UP', [0, 2, 1], habit1.pk, should_fail=True)
        move_habit('UP', [0, 1, 2], habit2.pk)


class HabitBrowserTestCase(SeleniumTestCase):
    def test_habits(self):
        self.common_login()
        self.user.profile.settings.is_opted_dev = True
        self.user.profile.settings.save()
        self.driver.refresh()

        # Open habits page
        self.click_el('habits-link')
        for _ in range(5):
            self.click_el('next-btn')

        # Create routine
        self.click_el('create-routine-btn')
        self.fill_text_element('title', 'Morning')
        self.submit_form()

        self.assert_for_n_seconds(lambda: Routine.objects.count() == 1)

        # Create habits
        habits = ['Wake up', 'Turn on computer', 'Check social media',
                  'Eat breakfast', 'Watch YouTube', 'Study with Alu', 'Start School']
        for habit in habits:
            self.fill_text_element('title', habit)
            self.click_el('create-habit-btn')
            self.sleep(2)

        self.assert_for_n_seconds(lambda: Habit.objects.count() == len(habits))
        self.click_el('next-btn')

        # helper funcs
        def get_habit(num):
            return Habit.objects.get(habit_num=num)

        def deselect(els_list):
            return lambda: els_list[(i + 1) % len(els_list)].click()

        # Give habits values
        habit_els = self.driver.find_elements_by_class_name('habit-card')
        values = ['positive', 'neutral', 'negative']
        for i, habit_el in enumerate(habit_els):
            habit_el.click()
            value = values[i % 3]
            btns = self.driver.find_elements_by_id(f'{value}-btn')
            btns[i].click()

            habit = get_habit(i)
            self.assert_for_n_seconds(
                lambda: habit.value == value.upper(),
                precall=lambda: habit.refresh_from_db(),
            )
        self.click_el('next-btn')

        # Label habit parts
        habit_parts = ['cue', 'craving', 'response', 'reward']
        for i, habit_el in enumerate(habit_els):
            for part in habit_parts:
                part_text = f'{part.capitalize()} - {i}'
                part_els = self.driver.find_elements_by_name(part)
                part_els[i].send_keys(part_text)
                deselect(part_els)()

                habit = get_habit(i)
                self.assert_for_n_seconds(
                    lambda: getattr(habit, part) == part_text,
                    precall=lambda: (habit.refresh_from_db(), deselect(part_els)()),
                )
        self.click_el('next-btn')

        # Answer habit strategies
        for i, habit_el in enumerate(habit_els):
            notes = f'Notes - {i}'
            note_els = self.driver.find_elements_by_name('notes')
            note_els[i].send_keys(notes)
            deselect(note_els)()

            habit = get_habit(i)
            self.assert_for_n_seconds(
                lambda: habit.notes == notes,
                precall=lambda: (habit.refresh_from_db(), deselect(note_els)()),
            )
        self.click_el('next-btn')

        # Final
        self.click_el('next-btn')
