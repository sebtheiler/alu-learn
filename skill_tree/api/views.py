from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import MainSection, SubSection


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deck_sections_percent_complete(request, deck_id, *args, **kwargs):
    main_sections = MainSection.objects.filter(
        deck__pk=deck_id,
        deck__user=request.user,
    ).prefetch_related('children')
    sub_sections = []

    def subsection_percent(sub_section):
        sub_sections.append(sub_section)
        return sub_section.get_percent_complete()

    sections_percent_complete = [{
        'id': main_section.pk,
        'percent_complete': main_section.get_percent_complete(),
        'children': [{
            'id': sub_section.pk,
            'percent_complete': subsection_percent(sub_section),
        } for sub_section in main_section.children.all()]
    } for main_section in main_sections]

    MainSection.objects.bulk_update(
        main_sections,
        ('cached_percent_complete', 'cached_percent_complete_time'),
    )
    SubSection.objects.bulk_update(
        sub_sections,
        ('cached_percent_complete', 'cached_percent_complete_time'),
    )

    return Response(sections_percent_complete, status=200)
