from sharing_system.models import MainSectionAction, SubSectionAction
from decks.models import Deck
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from skill_tree.serializers import MainSectionSerializer, SubSectionSerializer

from ..models import MainSection, SectionData, SubSection


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_main_section(request, *args, **kwargs):
    try:
        deck = Deck.objects.get(
            pk=request.data.get('deck_id'),
            user=request.user,
        )
    except Deck.DoesNotExist:
        return Response({'message': 'Deck not found'}, status=404)

    _, main_section = MainSection.create(
        title=request.data.get('title', 'New Main Section'),
        description=request.data.get('description', ''),
        deck=deck,
    )

    return Response(MainSectionSerializer(main_section).data, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_main_section(request, main_section_id, *args, **kwargs):
    try:
        main_section = MainSection.objects.get(
            pk=main_section_id,
            deck__user_id=request.user.pk,
        )
    except MainSection.DoesNotExist:
        return Response({'message': 'Main section not found'}, status=404)

    data = main_section.data
    edited_values = request.data.get('edited_values')
    for attr in SectionData.EDITABLE_ATTRS:
        setattr(data, attr, edited_values.get(attr, getattr(data, attr)))
    data.save()

    MainSectionAction.create_action('EDIT', main_section)

    return Response(MainSectionSerializer(main_section).data, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_sub_section(request, sub_section_id, *args, **kwargs):
    try:
        sub_section = SubSection.objects.get(
            pk=sub_section_id,
            main_section__deck__user_id=request.user.pk,
        )
    except SubSection.DoesNotExist:
        return Response({'message': 'Main section not found'}, status=404)

    data = sub_section.data
    edited_values = request.data.get('edited_values')
    for attr in SectionData.EDITABLE_ATTRS:
        setattr(data, attr, edited_values.get(attr, getattr(data, attr)))
    data.save()

    SubSectionAction.create_action('EDIT', sub_section)

    return Response(SubSectionSerializer(sub_section).data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sub_section(request, *args, **kwargs):
    try:
        main_section = MainSection.objects.get(
            pk=request.data.get('main_section_id'),
            deck__user_id=request.user.pk,
        )
    except MainSection.DoesNotExist:
        return Response({'message': 'Main section not found'}, status=404)

    _, sub_section = SubSection.create(
        title=request.data.get('title', 'New Sub Section'),
        description=request.data.get('description', ''),
        main_section=main_section,
    )

    return Response(SubSectionSerializer(sub_section).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deck_sections_percent_complete(request, deck_id, *args, **kwargs):
    main_sections = MainSection.objects.filter(
        deck__pk=deck_id,
        deck__user=request.user,
    ).prefetch_related('sub_sections')
    sub_sections = []

    def sub_section_percent(sub_section):
        sub_sections.append(sub_section)
        return sub_section.get_percent_complete()

    sections_percent_complete = [{
        'id': main_section.pk,
        'percent_complete': None,  # main_section.get_percent_complete(),
        'total_percent_complete': None,  # main_section.get_percent_complete(total=True),
        'sub_sections': [{
            'id': sub_section.pk,
            'percent_complete': sub_section_percent(sub_section),
            'total_percent_complete': sub_section.get_percent_complete(total=True),
        } for sub_section in main_section.sub_sections.all()]
    } for main_section in main_sections]

    MainSection.objects.bulk_update(
        main_sections,
        (
            'cached_percent_complete',
            'cached_total_percent_complete',
            'cached_percent_complete_time',
        ),
    )
    SubSection.objects.bulk_update(
        sub_sections,
        (
            'cached_percent_complete',
            'cached_total_percent_complete',
            'cached_percent_complete_time',
        ),
    )

    return Response(sections_percent_complete, status=200)
