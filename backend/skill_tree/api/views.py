from sharing_system.models import MainSectionAction, SubSectionAction
from decks.models import Deck
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from skill_tree.serializers import MainSectionSerializer, SubSectionSerializer

from ..models import AbstractSection, MainSection, SectionData, SubSection


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
    utc_timezone_offset = int(request.GET.get('utc_timezone_offset', 0))

    main_sections = MainSection.objects.filter(
        deck__pk=deck_id,
        deck__user=request.user,
    ).prefetch_related('sub_sections')
    sub_sections = []

    def sub_section_percent(sub_section):
        sub_sections.append(sub_section)
        return sub_section.get_percent_complete(utc_timezone_offset=utc_timezone_offset)

    sections_percent_complete = [{
        'id': main_section.pk,
        'percent_complete': None,
        'total_percent_complete': None,
        'sub_sections': [{
            'id': sub_section.pk,
            'percent_complete': sub_section_percent(sub_section),
            'total_percent_complete': sub_section.get_percent_complete(True, utc_timezone_offset),
        } for sub_section in main_section.sub_sections.all()]
    } for main_section in main_sections]

    return Response(sections_percent_complete, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_section_from_title(request, section_title):
    deck_id = request.GET.get('deck_id')
    if deck_id is None:
        return Response({'message': 'You must specify `deck_id`'}, status=400)

    try:
        section, is_main_section = AbstractSection.get_from_formatted_title(
            section_title,
            deck_id,
        )

        # Check that the current user has access to the section
        if (
            (is_main_section and section.deck.user != request.user)
            or
            (not is_main_section and section.main_section.deck.user != request.user)
        ):
            raise MainSection.DoesNotExist
    except (MainSection.DoesNotExist, SubSection.DoesNotExist):
        return Response({'message': 'Section not found'}, status=404)

    if is_main_section:
        return Response(
            {'section': MainSectionSerializer(section).data, 'is_main_section': True},
            status=200,
        )
    else:
        return Response(
            {'section': SubSectionSerializer(section).data, 'is_main_section': False},
            status=200,
        )
