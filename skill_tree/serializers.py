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
    live_counterpart = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AbstractAction
        fields = (
            'deck_id',
            'snapshot_id',
            'live_counterpart',
            'action',
            'id',
        )

    def get_live_counterpart(self, obj):
        if not self.context.get('full_detail') or obj.action == 'CREATE':
            return

        attr = self.Meta.universal_id
        return self.__class__(self.Meta.model.objects.filter(
            **{attr: getattr(obj, attr)},
            deck=None,
            submitted_changes=None,
        ).order_by('snapshot__timestamp').last()).data


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
    main_section = serializers.SerializerMethodField(read_only=True)

    class Meta(AbstractSectionSerializer.Meta):
        model = SubSection
        fields = AbstractSectionSerializer.Meta.fields + (
            'main_section',
            'universal_sub_section_id',
        )
        read_only_fields = fields

    def get_main_section(self, obj):
        if self.context.get('get_main_section'):
            return MainSectionSerializer(obj.main_section).data
        else:
            return obj.main_section_id


class SubSectionActionSerializer(AbstractActionSerializer):
    sub_section = SubSectionSerializer('sub_section')

    class Meta:
        model = SubSectionAction
        universal_id = 'universal_sub_section_id'
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
        universal_id = 'universal_main_section_id'
        fields = AbstractActionSerializer.Meta.fields + (
            'main_section',
            'universal_main_section_id',
        )
