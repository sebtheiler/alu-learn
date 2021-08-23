from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, ReviewInstance, ReviewInstanceHistory


class FlashCardAdmin(admin.ModelAdmin):
    search_fields = ('tags', 'deck__title', 'deck__user__username', 'fields')
    list_display = (
        'subsection',
        'flashcard_type',
        'flashcard_num',
        'fields',
    )
    model = FlashCard


class ReviewInstanceAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'flashcard']
    search_fields = ['flashcard__deck__title']

    class Meta:
        model = ReviewInstance


class ReviewInstanceHistoryAdmin(admin.ModelAdmin):
    model = ReviewInstanceHistory
    list_display = (
        'get_user',
        'get_deck',
        'grade_response',
        'time_taken',
        'next_review',
        'last_review',
        'timestamp',
    )
    list_filter = ('timestamp',)
    ordering = ('-timestamp',)

    def get_queryset(self, request):
        queryset = super(ReviewInstanceHistoryAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('review_instance__flashcard__deck__user')
        return queryset

    def get_user(self, obj):
        return self.get_deck(obj).user
    get_user.short_description = 'User'

    def get_deck(self, obj):
        return obj.review_instance.flashcard.deck
    get_deck.short_description = 'Deck'


class DeckAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user']
    search_fields = ['title', 'user__username', 'user__email']
    fields = [
        'user',
        'title',
        'student_attached_to',
        'equivalent_to_snapshot',
    ]

    class Meta:
        model = Deck


admin.site.register(Deck, DeckAdmin)
admin.site.register(FlashCard, FlashCardAdmin)
admin.site.register(ReviewInstance, ReviewInstanceAdmin)
admin.site.register(ReviewInstanceHistory, ReviewInstanceHistoryAdmin)
