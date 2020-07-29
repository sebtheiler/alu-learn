from django.db import models

# Create your models here.
class Deck(models.Model):
    title = models.CharField(max_length=128)

    # starting difficulty, new cards per day, ...
    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title
    
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
        }


class FlashCard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE)

    front_text = models.TextField()
    back_text = models.TextField()
    # audio (front/back)
    # image (front/back)

    # intervals, dificulty, ...

    def __str__(self):
        return self.front_text + '  ---  ' + self.back_text


class Tag(models.Model):
    flashcard = models.ForeignKey(FlashCard, on_delete=models.CASCADE)
    tag_text = models.CharField(max_length=64)

    def __str__(self):
        return self.tag_text