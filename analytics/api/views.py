import datetime as dt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models.query_utils import Q

from ..models import QuickFeedback, QuickFeedbackResponse
from ..serializers import QuickFeedbackSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quick_feedback_question(request, *args, **kwargs):
    """
    Gets a possible quick feedback question, if any are
        available and match the current user - GET
    """
    # Get all questions the user has not answered before
    possible_questions = QuickFeedback.objects.filter(~Q(
        responses__user__user__pk__contains=request.user.pk,
    ) & Q(disabled=False))

    # Helper functions
    def get_previous_history_count(num_days):
        return request.user.profile.history.filter(
            date__gte=dt.date.today() - dt.timedelta(days=num_days)
        ).count()

    # Find the first question that the user matches the requirements for
    question = None
    for possible_question in possible_questions:
        if possible_question.requirements == 'NONE':
            question = possible_question
            break
        if possible_question.requirements == 'STUDIED_TODAY':
            latest_history = request.user.profile.history.order_by('date').last()
            if latest_history.date == dt.date.today():
                question = possible_question
                break
        if possible_question.requirements == 'STUDY_PAST_WEEK':
            last_week_history_count = get_previous_history_count(7)
            if last_week_history_count >= 1:
                question = possible_question
                break
        if possible_question.requirements == 'STUDY_TWICE_PAST_WEEK':
            last_week_history_count = get_previous_history_count(7)
            if last_week_history_count >= 2:
                question = possible_question
                break
        if possible_question.requirements == 'STUDY_TEN_TIMES_PAST_MONTH':
            last_week_history_count = get_previous_history_count(30)
            if last_week_history_count >= 10:
                question = possible_question
                break
        if possible_question.requirements == 'IS_TEACHER':
            if request.user.profile.settings.user_type == 'TEACHER':
                question = possible_question
                break
        if possible_question.requirements == 'IS_STUDENT':
            if request.user.profile.settings.user_type == 'STUDENT':
                question = possible_question
                break

    if question is None:
        return Response({'message': 'No question available'}, status=200)

    return Response(QuickFeedbackSerializer(question).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_feedback_question(request, quick_feedback_id, *args, **kwargs):
    """
    Responds to a given QuickFeedback - POST

    Params:
        `feedback_question_id` (URL, int): Id of the QuickFeedback to respond to
        `response` (Data, str): Response to the quick feedback
    """
    try:
        question = QuickFeedback.objects.get(pk=quick_feedback_id)
    except QuickFeedback.DoesNotExist:
        return Response({'message': 'Quick feedback does not exist'}, status=404)

    response = request.data.get('response')
    if response is None or len(response) > 256:
        return Response({'message': 'You must specify a `response`'}, status=400)

    QuickFeedbackResponse.objects.create(
        quick_feedback=question,
        user=request.user.profile,
        answer=response,
    )

    return Response({'message': 'Responded successfully'}, status=200)
