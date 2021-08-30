from django.urls import path
from utils import generate_base_api
from sharing_system.models import MainSectionAction, SubSectionAction
from . import views

from ..serializers import MainSectionSerializer, SubSectionSerializer

# Base endpoint = /api/skill_tree/
urlpatterns = [
    *generate_base_api(
        'skill_tree', 'mainsection',
        MainSectionSerializer,
        {'title': str, 'description': str, 'deck_id': int},  # TODO: fix `deck_id` vulnerability
        'deck__user', 'USER',
        prefetch_list=('deck', 'sub_sections'),
        ActionModel=MainSectionAction,
        uuid_id=True,
        create_with_user=False,
    ),
    *generate_base_api(
        'skill_tree', 'subsection',
        SubSectionSerializer,
        {'title': str, 'description': str, 'main_section_id': str},
        'main_section__deck__user', 'USER',
        ActionModel=SubSectionAction,
        uuid_id=True,
        create_with_user=False,
    ),
    path('mainsection/<int:deck_id>/percent-complete/', views.get_deck_sections_percent_complete)
]
