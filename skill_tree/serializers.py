from rest_framework import serializers
from sharing_system.models import (AbstractAction, MainSectionAction,
                                   SubSectionAction)

from .models import AbstractSection, MainSection, SectionData, SubSection


class SectionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionData
        fields = (
            'title',
            'description',
            'id',
        )


class AbstractActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AbstractAction
        fields = (
            'deck_id',
            'snapshot_id',
            'action',
        )


class AbstractSectionSerializer(serializers.ModelSerializer):
    data = SectionDataSerializer('data')

    class Meta:
        model = AbstractSection
        fields = (
            'order_num',
            'data',
            'id',
        )
        read_only_fields = fields


class SubSectionSerializer(AbstractSectionSerializer):
    class Meta(AbstractSectionSerializer.Meta):
        model = SubSection
        fields = AbstractSectionSerializer.Meta.fields + (
            'main_section',  # just ID
        )
        read_only_fields = fields


class SubSectionActionSerializer(AbstractActionSerializer):
    sub_section = SubSectionSerializer('sub_section')

    class Meta:
        model = SubSectionAction
        fields = AbstractActionSerializer.Meta.fields + (
            'sub_section',
            'universal_sub_section_id',
        )


class MainSectionSerializer(AbstractSectionSerializer):
    sub_sections = SubSectionSerializer('sub_sections', many=True)

    class Meta(AbstractSectionSerializer.Meta):
        model = MainSection
        fields = AbstractSectionSerializer.Meta.fields + (
            'deck',  # just ID
            'sub_sections',
        )
        read_only_fields = fields


class MainSectionActionSerializer(AbstractActionSerializer):
    main_section = MainSectionSerializer('main_section')

    class Meta:
        model = MainSectionAction
        fields = AbstractActionSerializer.Meta.fields + (
            'main_section',
            'universal_main_section_id',
        )
