import datetime as dt

from decks.models import (Deck, DeckStudySessionManager, FlashCard,
                          FlashCardCreator, FlashCardField, SharedDeck)
from django.contrib.auth import get_user_model
from django.db.models.query_utils import Q
from rest_framework.test import APIRequestFactory
from utils.test_utils import ImprovedTestCase, SeleniumTestCase
from utils.utils import create_slate_element

from .api import views as api_views
from .models import Assignment, AssignmentStudySessionManager, Classroom

User = get_user_model()


class TeacherTestCase(ImprovedTestCase):
    def setUp(self) -> None:
        super().setUp()

        self.teacher = User.objects.create(
            first_name='John',
            last_name='Doe',
            username='johndoe',
            password='password',
            email='john@school.edu',
        )
        self.teacher.profile.settings.user_type = 'TEACHER'
        self.teacher.profile.settings.save()
        self.users[0] = self.teacher

        self.factory = APIRequestFactory()

    def create_classroom(self, title: str, num_students: int = 0, num_assignments: int = 0) -> Classroom:
        classroom, _ = Classroom.objects.get_or_create(
            title=title,
            code=Classroom.generate_class_code(),
        )
        classroom.teachers.add(self.teacher.profile)

        students = []
        for i in range(num_students):
            user = User.objects.create(
                first_name='Student',
                last_name='Join',
                username=f'studentlist{i}',
                password='password',
                email=f'studentlist{i}@school.edu',
            )
            students.append(user)
        classroom.students.set([student.profile for student in students])

        Assignment.objects.bulk_create([
            Assignment(
                title=f'Finish Unit {i + 1}',
                classroom=classroom,
                tag_query=f'unit {i + 1}',
                due_date='2011-10-05',
            )
            for i in range(num_assignments)
        ])

        return classroom

    def create_deck(
        self,
        title: str,
        num_flashcards: int,
        user: User = None,
    ) -> Deck:
        deck = Deck.objects.create(
            user=user or self.user,
            title=title,
        )
        DeckStudySessionManager.objects.create(
            user=user.profile if user else self.user.profile,
            deck=deck,
        )

        for i in range(num_flashcards):
            tags = f'{i}, {i + 1}, {i + 2}'
            FlashCardCreator.create_flashcard(
                deck,
                tags,
                'basic',
                [create_slate_element(str(i)), create_slate_element(str(i + 1))],
            )

        return deck

    def test_create_class_api(self):
        api_path = '/api/teachers/classroom/create/'

        # Attempt to create untitled class
        response = self.post_response(api_path, api_views.create_classroom_view)
        self.assertEqual(response.status_code, 400)

        # Create real class
        response = self.post_response(api_path, api_views.create_classroom_view, {
            'title': 'My Class',
        })
        self.assertEqual(response.status_code, 201)
        classroom = Classroom.objects.filter(title='My Class', teachers=self.teacher.profile).first()
        self.assertIsNotNone(classroom)
        self.assertIn(self.teacher.profile, classroom.teachers.all())

    def test_class_homepage_api(self):
        api_path = '/api/teachers/classroom/homepage'

        # Test without any classes
        response = self.get_response(api_path, api_views.classrooms_homepage_view)
        self.assertEqual(response.data, [])

        # Test after creating some classes
        self.create_classroom('Homepage123')
        self.create_classroom('Homepage321')
        response = self.get_response(api_path, api_views.classrooms_homepage_view)
        self.assertEqual(len(response.data), 2)

    def test_edit_class_api(self):
        api_path = '/api/teachers/classroom/edit/'

        # Create class
        classroom = self.create_classroom('Classroom To Edit')
        self.assertEqual(classroom.title, 'Classroom To Edit')

        # Edit class without specifying id
        response = self.post_response(api_path, api_views.edit_classroom_view)
        self.assertEqual(response.status_code, 404)

        # Edit class without specifying title
        response = self.post_response(api_path, api_views.edit_classroom_view, {
            'classroom_id': classroom.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classroom.title, 'Classroom To Edit')

        # Edit class
        response = self.post_response(api_path, api_views.edit_classroom_view, {
            'classroom_id': classroom.pk,
            'new_title': 'Edited Classroom',
        })
        classroom = Classroom.objects.get(pk=classroom.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classroom.title, 'Edited Classroom')

    def test_delete_class_api(self):
        api_path = '/api/teachers/classroom/delete/'

        # Create class
        classroom = self.create_classroom('Classroom To Delete')
        self.assertTrue(Classroom.objects.filter(pk=classroom.pk).exists())

        # Attempt to delete class without specifying id
        response = self.post_response(api_path, api_views.delete_classroom_view)
        self.assertEqual(response.status_code, 404)

        # Delete class
        response = self.post_response(api_path, api_views.delete_classroom_view, {
            'classroom_id': classroom.pk,
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Classroom.objects.filter(pk=classroom.pk).exists())

    def test_student_join_class_api(self):
        api_path = '/api/teachers/classroom/student-join/'

        # Create class
        classroom = self.create_classroom('Classroom To Join')
        self.assertFalse(classroom.students.exists())

        # Create student
        student = User.objects.create(
            first_name='Student',
            last_name='Join',
            username='joiningstudent',
            password='password',
            email='student@school.edu',
        )

        # Attempt to join class without code
        response = self.post_response(api_path, api_views.student_join_class_view, user=student)
        self.assertEqual(response.status_code, 404)

        # Join class
        response = self.post_response(api_path, api_views.student_join_class_view, user=student, data={
            'classroom_code': classroom.code,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classroom.students.count(), 1)

        # Try to join the class with a different email
        student = User.objects.create(
            first_name='Hacker',
            last_name='Man',
            username='hackerstudent',
            password='p@ssword',
            email='different@email.com',
        )

        response = self.post_response(api_path, api_views.student_join_class_view, user=student, data={
            'classroom_code': classroom.code,
        })
        self.assertEqual(response.status_code, 404)
        self.assertEqual(classroom.students.count(), 1)

    def test_student_joined_list_api(self):
        # Create student and class
        classroom = self.create_classroom('Another Classroom To Join')
        student = User.objects.create(
            first_name='Student',
            last_name='Join',
            username='joiningstudent',
            password='password',
            email='student@site.edu',
        )
        self.assertFalse(student.profile.classrooms_in.exists())

        # Add student
        classroom.students.add(student.profile)
        self.assertEqual(student.profile.classrooms_in.count(), 1)

        # Get list
        response = self.get_response('/api/teachers/classroom/joined/', api_views.student_joined_classes_view, user=student)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_classroom_detail_api(self):
        # Create classroom
        classroom = self.create_classroom('Detail Classroom')
        api_path = f'/api/teachers/classroom/detail/{classroom.pk}/'
        api_view = api_views.classroom_detail_view
        kwargs = {'classroom_id': classroom.pk}

        # Attempt access as unauthorized user
        response = self.get_response(api_path, api_view, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)

        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        self.assertIsInstance(response.data['message'], str)

        # Get detail
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'Detail Classroom')

    def test_classroom_students_list_api(self):
        # Create classroom and students
        N = 5
        classroom = self.create_classroom('List Classroom', N)
        api_path = f'/api/teachers/classroom/students/{classroom.pk}/'
        self.assertEqual(classroom.students.count(), N)

        # Get student list
        response = self.get_response(api_path, api_views.classroom_students_view, kwargs={'classroom_id': classroom.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), N)

    def test_teacher_attach_deck_api(self):
        # Create classroom and deck
        classroom = self.create_classroom('Teacher Attach Classroom')
        deck = self.create_deck('Deck to attach', 1000, user=self.teacher)
        api_path = f'/api/teachers/attach-deck/classroom/{classroom.pk}/'
        self.assertIsNone(deck.shared_deck)

        # Attempt to attach without specifying deck id
        response = self.post_response(api_path, api_views.teacher_attach_deck_view,
            kwargs={'classroom_id': classroom.pk},
        )
        self.assertEqual(response.status_code, 404)

        # Attach deck
        response = self.post_response(api_path, api_views.teacher_attach_deck_view,
            {'deck_id': deck.pk}, kwargs={'classroom_id': classroom.pk},
        )
        deck = Deck.objects.get(pk=deck.pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['creators'][0], deck.pk)
        self.assertIsNotNone(deck.shared_deck)
        self.assertEqual(deck.shared_deck.pk, response.data['id'])

    def test_student_attach_deck_api(self):
        # Create classroom
        classroom = self.create_classroom('Statistics Class', 1)
        student = classroom.students.first()
        api_path = f'/api/teachers/classroom/students/attach-deck/{classroom.pk}/'

        # Attempt to attach without deck
        response = self.post_response(api_path, api_views.student_attach_deck_view,
            kwargs={'classroom_id': classroom.pk}, user=student.user,
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['message'], 'Deck not found')

        # Create deck
        deck = Deck.objects.create(user=student.user, title='Deck to Attach')
        self.assertIsNone(deck.student_attached_to)

        # Attempt to attach as non-student
        response = self.post_response(api_path, api_views.student_attach_deck_view,
            data={'deck_id': deck.pk}, kwargs={'classroom_id': classroom.pk},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['message'], 'Classroom not found')

        # Attach deck
        response = self.post_response(api_path, api_views.student_attach_deck_view,
            data={'deck_id': deck.pk}, kwargs={'classroom_id': classroom.pk}, user=student.user,
        )
        deck = Deck.objects.get(pk=deck.pk)
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(deck.student_attached_to)

        # Attempt to attach again
        response = self.post_response(api_path, api_views.student_attach_deck_view,
            data={'deck_id': deck.pk}, kwargs={'classroom_id': classroom.pk}, user=student.user,
        )
        deck = Deck.objects.get(pk=deck.pk)
        self.assertEqual(response.status_code, 400)
        self.assertIsNotNone(deck.student_attached_to)

    def test_student_get_attached_get(self):
        # Create classroom and deck
        classroom = self.create_classroom('Statistics Class', 1)
        student = classroom.students.first()
        deck = Deck.objects.create(user=student.user, title='Attached deck')
        DeckStudySessionManager.objects.create(deck=deck)
        deck.student_attached_to = classroom
        deck.save()
        url_path = f'/api/teachers/classroom/{classroom.pk}/student/{student.pk}/attached-deck/'

        # Get attached deck
        response = self.get_response(url_path, api_views.student_get_attached_deck_view,
            kwargs={'classroom_id': classroom.pk, 'student_id': student.pk}, user=student.user,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], deck.id)

    def test_student_statistics_api(self):
        # Create classroom
        classroom = self.create_classroom('Statistics Class', 1)
        student = classroom.students.first()
        api_path = f'/api/teachers/classroom/{classroom.pk}/student/{student.pk}/stats/'

        # Attempt to get statistics without attaching deck
        response = self.get_response(api_path, api_views.student_statistics_view,
            kwargs={'classroom_id': classroom.pk, 'student_id': student.pk}
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['message'], 'Student deck not found')

        # Create and attach deck
        deck = Deck.objects.create(user=student.user, title='Attached deck', student_attached_to=classroom)
        self.assertEqual(deck.student_attached_to, classroom)

        # Get statistics
        response = self.get_response(api_path, api_views.student_statistics_view,
            kwargs={'classroom_id': classroom.pk, 'student_id': student.pk}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['deck_stats'], dict)
        self.assertIsInstance(response.data['student_history'], list)

    def test_create_assignment_api(self):
        # Create classroom
        classroom = self.create_classroom('Assignment Class', 1)
        api_view = api_views.create_assignment_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/create/'
        kwargs = {'classroom_id': classroom.pk}
        data = {
            'title': 'Finish Unit 1',
            'tag_query': 'unit 1',
            'due_date': '2011-10-05',
        }

        self.assertEqual(
            Assignment.objects.count(),
            0,
        )

        # Attempt to create assignment as non-owner
        response = self.post_response(api_path, api_view, data, kwargs=kwargs, user=self.users[1])
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            Assignment.objects.count(),
            0,
        )

        response = self.post_response(api_path, api_view, data, kwargs=kwargs, is_anon=True)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            Assignment.objects.count(),
            0,
        )

        # Create assignment
        response = self.post_response(api_path, api_view, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Assignment.objects.count(),
            1,
        )
        assignment = Assignment.objects.first()
        self.assertEqual(assignment.title, 'Finish Unit 1')
        self.assertEqual(assignment.classroom, classroom)
        self.assertEqual(assignment.tag_query, 'unit 1')
        self.assertEqual(assignment.due_date, dt.date(2011, 10, 5))

        # Create assignment with non-esssential version too
        data = {
            'title': 'Finish Unit 2',
            'tag_query': 'unit 2',
            'due_date': '2013-10-05',
            'create_essential_copy': True,
        }
        self.assertEqual(
            Assignment.objects.count(),
            1,
        )
        response = self.post_response(api_path, api_view, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Assignment.objects.count(),
            3,
        )
        assignment = Assignment.objects.get(title='Finish Unit 2')
        self.assertEqual(assignment.classroom, classroom)
        self.assertEqual(assignment.tag_query, 'unit 2')
        self.assertEqual(assignment.due_date, dt.date(2013, 10, 5))

        assignment = Assignment.objects.get(title='Finish Unit 2 (Essential Only)')
        self.assertEqual(assignment.classroom, classroom)
        self.assertEqual(assignment.tag_query, 'unit 2 AND essential')
        self.assertEqual(assignment.due_date, dt.date(2013, 10, 5))

    def test_assignments_teacher_list_api(self):
        # Create class
        classroom = self.create_classroom('Class with teacher assignments', num_assignments=5)
        api_view = api_views.assignments_teacher_list_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/'
        kwargs = {'classroom_id': classroom.pk}

        # Attempt to access as unauthorized user
        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)

        response = self.get_response(api_path, api_view, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)

        # Get assignments list
        response = self.get_response(api_path, api_view, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 5)
        for i, assignment in enumerate(response.data):
            self.assertEqual(assignment['title'], f'Finish Unit {i + 1}')
            self.assertEqual(assignment['classroom'], classroom.pk)
            self.assertEqual(assignment['tag_query'], f'unit {i + 1}')
            self.assertEqual(assignment['due_date'], '2011-10-05')
            self.assertIsNone(assignment['percent_complete'])
            self.assertIsInstance(assignment['id'], int)

    def test_assignments_student_list_api(self):
        # Create class
        classroom1 = self.create_classroom('Class 1 for student', num_students=1, num_assignments=5)
        classroom2 = self.create_classroom('Class 2 for student', num_assignments=5)
        api_view = api_views.assignments_student_list_view
        api_path = f'/api/teachers/classroom/student/assignments/'

        student = classroom1.students.first().user
        classroom2.students.add(student.profile)

        # Attempt to access as unauthorized user
        response = self.get_response(api_path, api_view, is_anon=True)
        self.assertEqual(response.status_code, 403)

        # Get assignments list
        response = self.get_response(api_path, api_view, user=student)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
        for classroom in response.data:
            self.assertEqual(len(classroom['assignments']), 5)
            for j, assignment in enumerate(classroom['assignments']):
                self.assertEqual(assignment['title'], f'Finish Unit {j + 1}')
                self.assertEqual(assignment['classroom'], classroom['id'])
                self.assertEqual(assignment['tag_query'], f'unit {j + 1}')
                self.assertEqual(assignment['due_date'], '2011-10-05')
                self.assertIsNone(assignment['percent_complete'])
                self.assertIsInstance(assignment['id'], int)

    def test_assignments_calc_percent_complete(self):
        # Create class
        classroom1 = self.create_classroom('Class 1 for student', num_students=1, num_assignments=1)
        classroom2 = self.create_classroom('Class 2 for student', num_assignments=1)
        assignment1 = classroom1.assignments.first()
        assignment2 = classroom2.assignments.first()

        api_path = f'/api/teachers/classroom/{classroom1.pk}/assignments/{assignment1.pk}/progress/'
        api_view = api_views.student_percent_complete_list
        kwargs = {'classroom_id': classroom1.pk, 'assignment_id': assignment1.pk}

        student = classroom1.students.first().user
        classroom2.students.add(student.profile)

        # Attach deck to classes
        classroom1_deck = self.create_deck('Clasroom #1 Deck', 10)
        classroom2_deck = self.create_deck('Clasroom #2 Deck', 10)

        shared_classroom1_deck = classroom1.attach_deck(classroom1_deck)
        shared_classroom2_deck = classroom2.attach_deck(classroom2_deck)

        # Check percent complete
        percent_complete1 = assignment1.calc_percent_complete(student)
        percent_complete2 = assignment2.calc_percent_complete(student)

        self.assertEqual(percent_complete1, None)
        self.assertEqual(percent_complete2, None)

        # Have student copy decks
        cloned_classroom1_deck = shared_classroom1_deck.clone(student, 'Copy of "Classroom #1 Deck"')
        cloned_classroom2_deck = shared_classroom2_deck.clone(student, 'Copy of "Classroom #2 Deck"')

        # Study and check progress
        flashcard_ids1 = [f.pk for f in FlashCard.objects.filter(creator__deck=cloned_classroom1_deck)]
        flashcard_ids2 = [f.pk for f in FlashCard.objects.filter(creator__deck=cloned_classroom2_deck)]

        for i in range(len(flashcard_ids1)):
            # Check percent complete
            percent_complete1 = assignment1.calc_percent_complete(student)
            percent_complete2 = assignment2.calc_percent_complete(student)

            self.assertEqual(percent_complete1, None)
            self.assertEqual(percent_complete2, None)

        # Update to have proper tags and study again
        FlashCardCreator.objects.filter(
            Q(deck__pk=shared_classroom1_deck.pk) |
            Q(deck__pk=shared_classroom2_deck.pk) |
            Q(deck__user=student)
        ).update(tags=assignment1.tag_query)

        for i in range(len(flashcard_ids1)):
            # Check percent complete
            percent_complete1 = assignment1.calc_percent_complete(student)
            percent_complete2 = assignment2.calc_percent_complete(student)

            self.assertEqual(percent_complete1, i/10)
            self.assertEqual(percent_complete2, i/10)

            # Test API
            response = self.get_response(api_path, api_view, kwargs=kwargs)
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.data, list)
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], f'{student.first_name} {student.last_name}')
            self.assertEqual(response.data[0]['percent_complete'], i/10)

            # Student study decks
            flashcard1 = FlashCard.objects.get(pk=flashcard_ids1[i])
            flashcard1.learning_status = 'LEARNED'
            flashcard2 = FlashCard.objects.get(pk=flashcard_ids2[i])
            flashcard2.learning_status = 'LEARNED'

            flashcard1.save()
            flashcard2.save()

        # Final check for percent complete
        percent_complete1 = assignment1.calc_percent_complete(student)
        percent_complete2 = assignment2.calc_percent_complete(student)

        self.assertEqual(percent_complete1, 1.0)
        self.assertEqual(percent_complete2, 1.0)

    def test_assignment_edit_api(self):
        # Create class
        classroom = self.create_classroom('Class with assignments to edit', num_assignments=3)
        assignment = classroom.assignments.first()
        api_view = api_views.edit_assignment_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/{assignment.pk}/edit/'
        kwargs = {'classroom_id': classroom.pk, 'assignment_id': assignment.pk}
        data = {
            'new_title': 'Edited assignment',
            'new_tag_query': 'NOT unit 1',
            'new_due_date': '2099-02-04',
        }

        def hasnt_changed():
            self.assertEqual(classroom.assignments.count(), 3)
            self.assertEqual(assignment.title, 'Finish Unit 1')
            self.assertEqual(assignment.tag_query, 'unit 1')
            self.assertEqual(str(assignment.due_date), '2011-10-05')

        hasnt_changed()

        # Attempt to edit as unauthorized user
        response = self.post_response(api_path, api_view, data, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        hasnt_changed()

        response = self.post_response(api_path, api_view, data, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)
        hasnt_changed()

        # Edit assignment
        response = self.post_response(api_path, api_view, data, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classroom.assignments.count(), 3)
        assignment = Assignment.objects.get(pk=assignment.pk)
        self.assertEqual(assignment.title, 'Edited assignment')
        self.assertEqual(assignment.tag_query, 'NOT unit 1')
        self.assertEqual(str(assignment.due_date), '2099-02-04')

    def test_assignment_delete_api(self):
        # Create class
        classroom = self.create_classroom('Class with teacher assignments', num_assignments=3)
        assignment = classroom.assignments.first()
        api_view = api_views.delete_assignment_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/{assignment.pk}/delete/'
        kwargs = {'classroom_id': classroom.pk, 'assignment_id': assignment.pk}
        self.assertEqual(classroom.assignments.count(), 3)

        # Attempt to edit as unauthorized user
        response = self.post_response(api_path, api_view, {}, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(classroom.assignments.count(), 3)

        response = self.post_response(api_path, api_view, {}, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(classroom.assignments.count(), 3)

        # Delete assignment
        response = self.post_response(api_path, api_view, {}, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classroom.assignments.count(), 2)

    def test_assignment_study_api(self):
        # Create class
        classroom = self.create_classroom('Class with assignment to study', 1, 1)
        assignment = classroom.assignments.first()
        student = classroom.students.first().user
        api_view = api_views.study_assignment_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/{assignment.pk}/study/'
        kwargs = {'classroom_id': classroom.pk, 'assignment_id': assignment.pk}

        # Create deck for class
        classroom_origin_deck = self.create_deck('Clasroom Deck', 30)
        classroom_shared_deck = classroom.attach_deck(classroom_origin_deck)

        self.assertEqual(
            Deck.objects.filter(user=student).count(),
            0,
        )
        self.assertEqual(
            AssignmentStudySessionManager.objects.filter(user=student.profile).count(),
            0,
        )

        # Helper function
        def check_deck_assignment_created():
            # check that deck was automatically cloned
            self.assertEqual(
                Deck.objects.filter(user=student).count(),
                1,
            )
            deck = Deck.objects.filter(user=student).first()
            self.assertEqual(
                FlashCardCreator.objects.filter(deck=deck).count(),
                30,
            )
            self.assertEqual(
                FlashCard.objects.filter(creator__deck=deck).count(),
                30,
            )
            self.assertEqual(
                FlashCardField.objects.filter(creator__deck=deck).count(),
                60,
            )

            # check that assm was created
            self.assertEqual(
                AssignmentStudySessionManager.objects.filter(user=student.profile).count(),
                1,
            )
            assm = AssignmentStudySessionManager.objects.filter(user=student.profile).first()
            self.assertEqual(assm.assignment, assignment)
            self.assertEqual(assm.new_cards_done_today, 0)

        # Attempt to study deck as unauthorized user
        response = self.get_response(api_path, api_view, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            Deck.objects.filter(user=student).count(),
            0,
        )
        self.assertEqual(
            AssignmentStudySessionManager.objects.filter(user=student.profile).count(),
            0,
        )

        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        self.assertIsInstance(response.data.get('message'), str)
        self.assertEqual(
            Deck.objects.filter(user=student).count(),
            0,
        )
        self.assertEqual(
            AssignmentStudySessionManager.objects.filter(user=student.profile).count(),
            0,
        )

        # Study the deck (but the tags in the deck are wrong)
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 0)
        check_deck_assignment_created()

        # Update to have proper tags
        FlashCardCreator.objects.filter(
            Q(deck__pk=classroom_origin_deck.pk) |
            Q(deck__user=student)
        ).update(tags=assignment.tag_query)

        # Study the deck
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 20)
        check_deck_assignment_created()

        # Study again (to make sure assm/deck aren't created again)
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 20)
        check_deck_assignment_created()

        # === TESTING AUTOUPDATE ===
        # Update the original deck
        creator_num = FlashCardCreator.objects.filter(deck=classroom_origin_deck).count()
        flashcard_num = FlashCard.objects.filter(creator__deck=classroom_origin_deck).count()
        field_num = FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count()
        FlashCardCreator.objects.filter(deck=classroom_origin_deck).first().delete()
        self.assertEqual(
            FlashCardCreator.objects.filter(deck=classroom_origin_deck).count(),
            creator_num - 1,
        )
        self.assertEqual(
            FlashCard.objects.filter(creator__deck=classroom_origin_deck).count(),
            flashcard_num - 1,
        )
        self.assertEqual(
            FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count(),
            field_num - 2,
        )

        # Update the classroom deck
        self.assertNotEqual(
            FlashCardCreator.objects.filter(deck=classroom_origin_deck).count(),
            FlashCardCreator.objects.filter(deck=classroom_shared_deck).count(),
        )
        self.assertNotEqual(
            FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCardField.objects.filter(creator__deck=classroom_shared_deck).count(),
        )
        classroom_shared_deck.push_updates(classroom_origin_deck)
        self.assertEqual(
            FlashCardCreator.objects.filter(deck=classroom_origin_deck).count(),
            FlashCardCreator.objects.filter(deck=classroom_shared_deck).count(),
        )
        self.assertEqual(
            FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCardField.objects.filter(creator__deck=classroom_shared_deck).count(),
        )

        # Study the assignment and make sure the student-copied deck gets updated
        student_deck = Deck.objects.get(user=student)
        self.assertNotEqual(
            FlashCardCreator.objects.filter(deck=classroom_origin_deck).count(),
            FlashCardCreator.objects.filter(deck=student_deck).count(),
        )
        self.assertNotEqual(
            FlashCard.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCard.objects.filter(creator__deck=student_deck).count(),
        )
        self.assertNotEqual(
            FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCardField.objects.filter(creator__deck=student_deck).count(),
        )
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 20)
        self.assertEqual(
            FlashCardCreator.objects.filter(deck=classroom_origin_deck).count(),
            FlashCardCreator.objects.filter(deck=student_deck).count(),
        )
        self.assertEqual(
            FlashCard.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCard.objects.filter(creator__deck=student_deck).count(),
        )
        self.assertEqual(
            FlashCardField.objects.filter(creator__deck=classroom_origin_deck).count(),
            FlashCardField.objects.filter(creator__deck=student_deck).count(),
        )

    def test_assignment_detail_api(self):
        # Create class
        classroom = self.create_classroom('Class with assignment to get detail', 1, 1)
        assignment = classroom.assignments.first()
        student = classroom.students.first().user
        api_view = api_views.assignment_detail_view
        api_path = f'/api/teachers/classroom/{classroom.pk}/assignments/{assignment.pk}/'
        kwargs = {'classroom_id': classroom.pk, 'assignment_id': assignment.pk}

        # Attempt as unauthorized user
        response = self.get_response(api_path, api_view, is_anon=True, kwargs=kwargs)
        self.assertEqual(response.status_code, 403)

        response = self.get_response(api_path, api_view, user=self.users[1], kwargs=kwargs)
        self.assertEqual(response.status_code, 404)
        self.assertIsInstance(response.data.get('message'), str)

        # Get assignment detail
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], assignment.title)
        self.assertEqual(response.data['classroom'], classroom.pk)
        self.assertEqual(response.data['tag_query'], assignment.tag_query)
        self.assertEqual(response.data['due_date'], str(assignment.due_date))
        self.assertEqual(response.data['percent_complete'], None)
        self.assertEqual(response.data['study_session_manager'], None)
        self.assertEqual(response.data['id'], assignment.pk)

        # Check that it can get its ASSM for the current user
        assm = AssignmentStudySessionManager.objects.create(
            assignment=assignment,
            user=student.profile,
        )
        response = self.get_response(api_path, api_view, user=student, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['study_session_manager'], assm.pk)


class TeacherBrowserTestCase(SeleniumTestCase):
    def test_deck_homepage(self):
        self.common_login()
        self.user.profile.settings.user_type = 'TEACHER'
        self.user.profile.settings.save()
        self.driver.refresh()

        # Create a classroom
        self.assertEqual(
            Classroom.objects.count(),
            0,
        )
        self.driver.find_element_by_id('create-classroom-btn').click()
        self.fill_text_element('title', 'Selenium class')
        self.driver.find_element_by_id('create-edit-btn').click()
        self.sleep(0.5)
        self.assertEqual(
            Classroom.objects.count(),
            1,
        )
        classroom = Classroom.objects.first()
        self.assertEqual(classroom.title, 'Selenium class')
        self.assertEqual(classroom.teachers.first(), self.user.profile)
        self.assertEqual(classroom.students.count(), 0)
        self.assertIsNone(classroom.deck)
        self.assertTextExists('Selenium class')

        # Edit the class
        self.driver.find_element_by_class_name('classroom-edit-btn').click()
        self.fill_text_element('title', 'Edited Selenium class')
        self.driver.find_element_by_id('create-edit-btn').click()
        self.sleep(0.5)
        self.assertEqual(
            Classroom.objects.count(),
            1,
        )
        classroom = Classroom.objects.first()
        self.assertEqual(classroom.title, 'Edited Selenium class')
        self.assertEqual(classroom.teachers.first(), self.user.profile)
        self.assertEqual(classroom.students.count(), 0)
        self.assertIsNone(classroom.deck)
        self.assertTextExists('Edited Selenium class')

        # View the class
        self.driver.find_element_by_class_name('classroom-view-btn').click()
        self.assertTextExists('Class Code')
        self.assertTextExists('You don\'t have any decks yet')
        self.assertTextExists('You can create assignments after you attach a deck.')

        # Add a student
        self.driver.find_element_by_id('students-tab').click()
        self.sleep(0.1)
        self.assertTextExists('You don\'t have any students')
        classroom.students.add(self.users[1].profile)
        self.driver.refresh()
        self.driver.find_element_by_id('students-tab').click()
        self.sleep(0.5)
        self.driver.find_element_by_xpath(
            '//*[contains(@data-testid, "expander-button")]'
        ).click()  # click the expander dropdown in the student data table
        self.assertTextExists('It doesn\'t look like')

        # Attach a deck
        deck = Deck.objects.create(
            user=self.user,
            title='Deck for selenium class',
        )
        DeckStudySessionManager.objects.create(
            deck=deck,
        )

        num_flashcards = 10
        for i in range(num_flashcards):
            FlashCardCreator.create_flashcard(
                deck,
                '1, 2, 3',
                'basic',
                [create_slate_element(str(i)), create_slate_element(str(i + 1))],
            )

        self.driver.refresh()
        self.driver.find_element_by_id('attach-deck-btn').click()
        self.sleep(0.5)
        classroom = Classroom.objects.first()
        self.assertIsNone(classroom.deck)

        self.click_option(str(deck.pk))
        self.driver.find_element_by_id('attach-deck-btn').click()
        self.sleep(2)
        classroom = Classroom.objects.first()
        shared_deck = SharedDeck.objects.first()
        self.assertEqual(classroom.deck, shared_deck)
        self.assertTextExists('Deck for selenium class')
        self.assertTextExists('Push Changes')
        self.assertTextExists('View Flashcards')
        self.assertTextExists('Create Assignment')

        # Login as student
        self.new_login(self.users[2].username)
        self.assertTextExists('Welcome!')

        # Join class
        self.assertEqual(classroom.students.count(), 1)
        self.driver.find_element_by_id('join-class-btn').click()
        self.fill_text_element('classCode', classroom.code)
        self.driver.find_element_by_id('join-modal-btn').click()
        self.sleep(0.5)
        self.assertEqual(classroom.students.count(), 2)
        self.assertEqual(classroom.students.last(), self.users[2].profile)
        self.driver.find_element_by_id('classes-dropdown').click()
        self.assertTextExists(classroom.title)
        self.assertTextExists('No assignments!  Yay!')

        # Login as teacher
        self.new_login(self.user.username)
        self.driver.find_element_by_class_name('classroom-view-btn').click()

        # Create assignment
        self.driver.find_element_by_id('create-assignment-btn').click()
        self.sleep(1)
        self.fill_text_element('title', 'Finish Unit 1')
        self.driver.find_element_by_name('tagQuery').click()  # let it figure out the tag query
        # date_picker = self.driver.find_element_by_class_name(
        #     'react-date-picker__inputGroup'
        # )  # I can't figure how to automate date selection

        self.assertEqual(
            Assignment.objects.count(),
            0,
        )
        self.driver.find_element_by_id('assignment-edit-create-btn').click()
        self.sleep(1)
        self.assertEqual(
            Assignment.objects.count(),
            1,
            'Assignment model object not created',
        )
        assignment = Assignment.objects.first()
        self.assertEqual(assignment.title, 'Finish Unit 1')
        self.assertEqual(assignment.tag_query, 'unit 1')

        # Edit asssignment
        self.driver.find_element_by_class_name('edit-assignment-btn').click()
        self.sleep(1)
        self.fill_text_element('title', 'Finish Unit 1!')
        self.driver.find_element_by_id('assignment-edit-create-btn').click()
        self.sleep(1)
        self.assertEqual(
            Assignment.objects.count(),
            1,
        )
        assignment = Assignment.objects.first()
        self.assertEqual(assignment.title, 'Finish Unit 1!')
        self.assertEqual(assignment.tag_query, 'unit 1')

        # Login as student
        self.new_login(self.users[2].username)
        self.assertEqual(
            self.driver.find_element_by_class_name('assignment-table__percent-complete').text,
            '0%',
        )

        # Study assignment
        self.driver.find_element_by_class_name('assignment-link').click()
        self.sleep(0.5)
        self.assertTextExists('Congratulations!')

        # Update flashcards to match assignment tag query
        FlashCardCreator.objects.filter(
            (
                Q(deck__pk=classroom.deck.pk) |
                Q(deck__user=self.users[2])
            ) &
            Q(flashcard_num__lt=5)
        ).update(tags=assignment.tag_query)

        # Study assignment
        self.driver.refresh()

        # Study deck
        for i in range(5):
            self.driver.find_element_by_id('showanswer').click()

            self.assertTextExists('Again')
            self.assertTextExists('Good', class_name='btn')
            self.assertTextExists('Easy')
            self.assertTextNotExists('Hard')

            self.find_element_by_text('Easy').click()
            self.sleep(0.1)

        self.assertTextExists('Congratulations!')
        self.driver.find_element_by_id('assignments-home-btn').click()
        self.sleep(1)
        self.assertEqual(
            self.driver.find_element_by_class_name('assignment-table__percent-complete').text,
            '100%',
        )
