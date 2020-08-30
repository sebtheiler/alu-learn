from django.contrib import admin
from .models import ExperimentController, Experiment

admin.site.register(ExperimentController)
admin.site.register(Experiment)