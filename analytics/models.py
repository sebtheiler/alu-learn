from profiles.models import Profile
from django.db import models
from django.db.models import Q


class ExperimentController(models.Model):
    name = models.CharField(max_length=32)
    short_name = models.CharField(max_length=12, unique=True)
    num_parameters = models.PositiveSmallIntegerField() # < 32

    def __str__(self):
        return self.name


    def get_success_ratio(self, inc_none_as_fail=False):
        """
        Gets the number of successful to unsuccessful experiments
        """
        successes = self.experiments.filter(successful=True).count()
        if inc_none_as_fail:
            failures = self.experiments.filter(Q(successful=False) | Q(successful=None)).count()
        else:
            failures = self.experiments.filter(successful=False).count()
        return successes / failures

    
    def get_success_rate(self, inc_none_as_fail=False):
        """
        Gets the rate at which the experiment succeeds
        """
        successes = self.experiments.filter(successful=True).count()
        if inc_none_as_fail:
            failures = self.experiments.filter(Q(successful=False) | Q(successful=None)).count()
        else:
            failures = self.experiments.filter(successful=False).count()
        return successes / (failures + successes)


    def add_data_piece(self, parameters, successful):
        """
        Adds an experiment to the list of experiments
        """
        self.experiments.create(
            controller=self,
            parameters=parameters,
            successful=successful,
        )


    def list_successful_params(self):
        """
        Finds which parameters are most successful

        Note: this function is not too optimized, as it is performed seldomly
        """
        experiment_qs = self.experiments.all()

        # Calculate success rate for each parameter
        param_successes = []
        for param_id in range(self.num_parameters):
            experiments_with_param = [experiment for experiment in experiment_qs if experiment.parameters[param_id] == '1']
            param_success_rate = len(experiments_with_param) / experiment_qs.count()
            param_successes.append((param_id, param_success_rate))

        # Sort by success rate
        param_successes = sorted(param_successes, key=lambda x: x[1], reverse=True)
        return param_successes


class Experiment(models.Model):
    controller = models.ForeignKey(ExperimentController, on_delete=models.CASCADE, related_name='experiments')
    parameters = models.CharField(verbose_name='Experiment ID', max_length=32)
    successful = models.NullBooleanField(default=None)

    def __str__(self) -> str:
        return f'Experiment {self.parameters} for {self.controller.name}'


class ShortUrl(models.Model):
    code = models.CharField(max_length=6, unique=True)
    destination = models.CharField(max_length=256)

    def __str__(self) -> str:
        return f'{self.code} => {self.destination}'


class UrlHit(models.Model):
    url = models.ForeignKey(ShortUrl, on_delete=models.CASCADE, related_name='hits')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='hits', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=200)
    ip_address = models.CharField(max_length=45)

    def __str__(self) -> str:
        return f'URL Hit by "{self.user}" on "{self.url}"'
