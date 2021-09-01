from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, ReviewInstance, ReviewInstanceHistory


class FlashCardAdmin(admin.ModelAdmin):
    search_fields = ('tags', 'deck__title', 'deck__user__username', 'fields')
    list_display = (
        'get_section',
        'flashcard_type',
        'flashcard_num',
        'fields',
    )
    model = FlashCard

    def get_queryset(self, request):
        queryset = super(FlashCardAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('sub_sections__main_section__deck')
        return queryset

    def get_section(self, obj):
        return f'''
            {(
                obj.sub_sections.first().main_section.deck.title
                if obj.sub_sections.first().main_section.deck else
                obj.sub_sections.first().main_section.snapshot.message
            )} >
            {obj.sub_sections.first().main_section.title} >
            {obj.sub_sections.first().title}'''
    get_section.short_description = 'Section'
    get_section.admin_order_field = 'sub_sections__main_section__deck__title'


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
        try:
            return self.get_deck(obj).user
        except AttributeError:
            return None
    get_user.short_description = 'User'

    def get_deck(self, obj):
        try:
            return obj.review_instance.flashcard.deck
        except AttributeError:
            return None
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
