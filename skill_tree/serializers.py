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
            'parent',  # just ID
        )
        read_only_fields = fields


class MainSectionSerializer(AbstractSectionSerializer):
    children = SubSectionSerializer('children', many=True)

    class Meta(AbstractSectionSerializer.Meta):
        model = MainSection
        fields = AbstractSectionSerializer.Meta.fields + (
            'deck',  # just ID
            'children',
        )
        read_only_fields = fields
