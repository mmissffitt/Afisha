from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'date', 'venue', 'is_popular')
    list_filter = ('category', 'is_popular', 'date')
    search_fields = ('title', 'description', 'venue', 'participants')
    date_hierarchy = 'date'
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'category', 'date', 'venue')
        }),
        ('Детали', {
            'fields': ('participants', 'description', 'price', 'image')
        }),
        ('Дополнительно', {
            'fields': ('is_popular',)
        }),
    )