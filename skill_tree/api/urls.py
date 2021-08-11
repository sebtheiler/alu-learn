from utils import generate_base_api

from ..serializers import MainSectionSerializer, SubSectionSerializer

# Base endpoint = /api/skill_tree/
urlpatterns = [
    *generate_base_api(
        'skill_tree', 'mainsection',
        MainSectionSerializer,
        {'title': str},
        'deck__user', 'USER',
        prefetch_list=('deck', 'children'),
        exclude_create=True,
        exclude_delete=True,
    ),
    *generate_base_api(
        'skill_tree', 'subsection',
        SubSectionSerializer,
        {'title': str},
        'parent__deck__user', 'USER',
        exclude_create=True,
        exclude_delete=True,
    ),
]
