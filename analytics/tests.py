import datetime as dt

from profiles.models import ProfileHistorySegment
from utils.test_utils import ImprovedTestCase

from .api import views as api_views
from .models import QuickFeedback, QuickFeedbackResponse


class PagesTestClass(ImprovedTestCase):
    def create_quick_feedback_question(self) -> QuickFeedback:
        return QuickFeedback.objects.create(
            prompt='Prompt',
            description='Description',
            answer_type='YES/NO',
            requirements='NONE',
        )

    def test_get_quick_feedback_question_api(self):
        api_path = '/api/analytics/feedback/get-question/'
        api_view = api_views.get_quick_feedback_question
        self.assertEqual(QuickFeedback.objects.count(), 0)

        # Helper functions
        def test_no_question_available(response):
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['message'], 'No question available')

        def test_question_available(response, question):
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['prompt'], question.prompt)
            self.assertEqual(response.data['description'], question.description)
            self.assertEqual(response.data['answer_type'], question.answer_type)
            self.assertEqual(response.data['requirements'], question.requirements)
            self.assertEqual(response.data['id'], question.pk)

        # Test with no quick feedback question available
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        # Create question with no requirements and test again
        question = self.create_quick_feedback_question()
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test studied past week
        question.requirements = 'STUDY_PAST_WEEK'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        ProfileHistorySegment.objects.create(
            profile=self.user.profile,
            date=dt.date.today() - dt.timedelta(days=3),
            cards_done=1,
        )
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test studied twice in past week
        question.requirements = 'STUDY_TWICE_PAST_WEEK'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        ProfileHistorySegment.objects.create(
            profile=self.user.profile,
            date=dt.date.today() - dt.timedelta(days=4),
            cards_done=1,
        )
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test studied today
        question.requirements = 'STUDIED_TODAY'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        ProfileHistorySegment.objects.create(
            profile=self.user.profile,
            date=dt.date.today(),
            cards_done=1,
        )
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test studied 10 times past month
        question.requirements = 'STUDY_TEN_TIMES_PAST_MONTH'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        for i in range(8):
            ProfileHistorySegment.objects.create(
                profile=self.user.profile,
                date=dt.date.today() - dt.timedelta(days=10 + i),
                cards_done=1,
            )
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test is teacher
        question.requirements = 'IS_TEACHER'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        self.user.profile.settings.user_type = 'TEACHER'
        self.user.profile.settings.save()
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

        # Test is teacher
        question.requirements = 'IS_STUDENT'
        question.save()
        response = self.get_response(api_path, api_view)
        test_no_question_available(response)

        self.user.profile.settings.user_type = 'STUDENT'
        self.user.profile.settings.save()
        response = self.get_response(api_path, api_view)
        test_question_available(response, question)

    def test_respond_to_feedback_question_api(self):
        question = self.create_quick_feedback_question()
        api_path = f'/api/analytics/feedback/{question.pk}/respond/'
        api_view = api_views.respond_to_feedback_question
        kwargs = {'quick_feedback_id': question.pk}
        self.assertEqual(QuickFeedbackResponse.objects.count(), 0)

        # Test responding to feedback question
        response = self.post_response(api_path, api_view, {
            'response': 'Response',
        }, kwargs=kwargs)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(QuickFeedbackResponse.objects.count(), 1)

        quick_feedback_response = QuickFeedbackResponse.objects.first()
        self.assertEqual(quick_feedback_response.quick_feedback, question)
        self.assertEqual(quick_feedback_response.user, self.user.profile)
        self.assertEqual(quick_feedback_response.answer, 'Response')
