from django.db import models
from profiles.models import Profile


class Routine(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='routines')
    title = models.CharField(max_length=64)
    ordered = models.BooleanField(default=True)
    routine_num = models.PositiveSmallIntegerField()  # 0-indexed

    class Meta:
        ordering = ['routine_num']

    def __str__(self) -> str:
        return self.title

    @staticmethod
    def get_routine_num(user: Profile) -> int:
        return user.routines.count()

    def get_habit_num(self) -> int:
        return self.habits.count()


class Habit(models.Model):
    title = models.CharField(max_length=64)
    cue = models.CharField(max_length=128, blank=True)
    craving = models.CharField(max_length=128, blank=True)
    response = models.CharField(max_length=128, blank=True)
    reward = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)
    habit_num = models.PositiveSmallIntegerField()  # 0-indexed
    history = models.JSONField(default=list)

    VALUE_CHOICES = [
        ('POSITIVE', 'Positive'),
        ('NEGATIVE', 'Negative'),
        ('NEUTRAL', 'Neutral'),
    ]
    value = models.CharField(max_length=10, choices=VALUE_CHOICES)

    routine = models.ForeignKey(
        Routine,
        on_delete=models.CASCADE,
        related_name='habits',
    )

    class Meta:
        ordering = ('habit_num',)

    def __str__(self) -> str:
        return self.title


class Todo(models.Model):
    text = models.CharField(max_length=512)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('timestamp',)

    def __str__(self) -> str:
        return self.text

    # Called when the user creates their first routine
    # POpulates their todo-list with some examples
    @staticmethod
    def initial_populate(user: Profile):
        examples = [
            'Mark your completed habits as finished for the day (click circle)',
            'Fill out the components and strategies for another habit',
            'Create another routine (e.g., evening)',
        ]
        Todo.objects.bulk_create([
            Todo(
                text=example,
                profile=user,
            )
            for example in examples
        ])
