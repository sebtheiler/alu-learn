from django.contrib import admin

# Register your models here.
from .models import Deck, FlashCard, ReviewInstance, ReviewInstanceHistory


class FlashCardAdmin(admin.ModelAdmin):
    search_fields = ('data__tags', 'data__fields')
    list_display = (
        'get_section',
        'flashcard_type',
        'order_num',
        'data_fields',
    )
    model = FlashCard

    def get_queryset(self, request):
        # TODO: make use less queries
        queryset = super(FlashCardAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related('sub_section__main_section__deck')
        return queryset

    def get_section(self, obj):
        try:
            return f'''
                {(
                    obj.sub_section.main_section.deck.title
                    if obj.sub_section.main_section.deck else
                    obj.sub_section.main_section.snapshot.message
                )} >
                {obj.sub_section.main_section.data.title} >
                {obj.sub_section.data.title}'''
        except AttributeError:
            return 'Section not found'
    get_section.short_description = 'Section'
    get_section.admin_order_field = 'sub_section__main_section__deck__title'

    def data_fields(self, obj):
        return obj.data.fields
    data_fields.short_description = 'Fields'


class ReviewInstanceAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'flashcard', 'get_deck']
    search_fields = ['flashcard__sub_section__main_section__deck__title']

    class Meta:
        model = ReviewInstance

    def get_queryset(self, request):
        queryset = super(ReviewInstanceAdmin, self).get_queryset(request)
        queryset = queryset.prefetch_related(
            'flashcard__sub_section__main_section__deck',
            'flashcard__sub_section__main_section__snapshot__shared_deck',
        )
        return queryset

    def get_deck(self, obj):
        try:
            return (
                obj.flashcard.sub_section.main_section.deck
                or
                obj.flashcard.sub_section.main_section.shared_deck
            )
        except AttributeError:
            return 'Deck not found'
    get_deck.short_description = '(Shared) Deck'


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
        queryset = queryset.prefetch_related(
            'review_instance__flashcard__sub_section__main_section__deck__user',
        )
        return queryset

    def get_user(self, obj):
        try:
            return self.get_deck(obj).user
        except AttributeError:
            return None
    get_user.short_description = 'User'

    def get_deck(self, obj):
        try:
            return obj.review_instance.flashcard.sub_section.main_section.deck
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
