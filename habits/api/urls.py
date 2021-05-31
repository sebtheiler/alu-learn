from django.urls import path
from . import views

urlpatterns = [
    path('routines/create/', views.routine_create),
    path('routines/', views.routine_list),
    path('routines/edit/<int:routine_id>/', views.routine_edit),
    path('routines/delete/<int:routine_id>/', views.routine_delete),
    path('routines/rearrange/<int:routine_id>/', views.routine_rearrange),
    path('routines/<routine_id>/habits/create/', views.habit_create),
    path('routines/<routine_id>/habits/edit/<int:habit_id>/', views.habit_edit),
    path('routines/<routine_id>/habits/delete/<int:habit_id>/', views.habit_delete),
    path('routines/<routine_id>/habits/rearrange/<int:habit_id>/', views.habit_rearrange),
]
