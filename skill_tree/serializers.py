from rest_framework import serializers

from .models import AbstractSection, MainSection, SubSection


class AbstractSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AbstractSection
        fields = (
            'title',
            'description',
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


class MainSectionSerializer(AbstractSectionSerializer):
    sub_sections = SubSectionSerializer('sub_sections', many=True)

    class Meta(AbstractSectionSerializer.Meta):
        model = MainSection
        fields = AbstractSectionSerializer.Meta.fields + (
            'deck',  # just ID
            'sub_sections',
        )
        read_only_fields = fields
