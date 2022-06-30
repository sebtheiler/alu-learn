from django.http.response import Http404
from django.shortcuts import redirect
from skill_tree.models import AbstractSection, SubSection
from utils import permissions

from .models import Classroom


def get_student_sub_section(request, classroom_id, sub_section):
    # Get teacher sub section
    titles = sub_section.split('__')
    if len(titles) != 2:
        raise Http404()

    teacher_sub_section = SubSection.objects.filter(
        attached_assignments__classrooms__pk=classroom_id,
        main_section__data__title__iexact=AbstractSection.clean(titles[0]),
        data__title__iexact=AbstractSection.clean(titles[1]),
    ).first()
    if teacher_sub_section is None:
        raise Http404()

    # Get classroom
    try:
        classroom = Classroom.objects.get(pk=classroom_id)
    except Classroom.DoesNotExist:
        raise Http404()

    if not classroom.students.filter(pk=request.user.profile.pk).exists():
        raise Http404()

    # Update/clone the deck the student attached to the classroom
    classroom.get_student_copied_deck(request.user, copy_if_missing=False)

    # Get the sub section to study
    try:
        student_sub_section = SubSection.objects.filter(
            universal_sub_section_id=teacher_sub_section.universal_sub_section_id,
            main_section__deck__user=request.user,
        ).first()  # NOTE: we use .first() instead of .get() if there are multiple decks
    except SubSection.DoesNotExist:
        raise Http404()

    return student_sub_section


@permissions()
def classroom_study_sub_section(request, classroom_id, sub_section):
    student_sub_section = get_student_sub_section(request, classroom_id, sub_section)

    url = f'/deck/{student_sub_section.main_section.deck_id}/study/{sub_section}/'
    url = f'{url}?isAssignment=true'
    if request.GET.get('essentialOnly') == 'true':
        url += '&essentialOnly=true'

    return redirect(url)


@permissions()
def classroom_flashcards(request, classroom_id, sub_section, *args, **kwargs):
    student_sub_section = get_student_sub_section(request, classroom_id, sub_section)

    url = f'/deck/{student_sub_section.main_section.deck_id}/flashcards/sections/{sub_section}/'
    return redirect(f'{url}?isAssignment=true')
