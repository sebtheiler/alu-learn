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
        {'title': str, 'description': str},
        'deck__user', 'USER',
        ActionModel=MainSectionAction,
        create_with_user=False,
        exclude_create=True,
        exclude_rearrange=False,
        parent_model='deck',
        prefetch_list=('deck', 'sub_sections'),
        uuid_id=True,
    ),
    path('mainsection/create/', views.create_main_section),
    path('mainsection/<int:deck_id>/percent-complete/', views.get_deck_sections_percent_complete),
    *generate_base_api(
        'skill_tree', 'subsection',
        SubSectionSerializer,
        {'title': str, 'description': str},
        'main_section__deck__user', 'USER',
        ActionModel=SubSectionAction,
        create_with_user=False,
        exclude_create=True,
        exclude_rearrange=False,
        parent_model='main_section',
        uuid_id=True,
    ),
    path('subsection/create/', views.create_sub_section),
]
