from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Event


class EventFilter:
    def __init__(self, queryset=None):
        self.queryset = queryset if queryset is not None else Event.objects.all()

    def apply_filters(self, category='all', date_filter='all', search='', 
                     date_start='', date_end='', sort='default'):
        self._filter_by_category(category)
        self._filter_by_date(date_filter, date_start, date_end)
        self._filter_by_search(search)
        self._apply_sorting(sort)
        return self.queryset

    def _filter_by_category(self, category):
        if category != 'all':
            self.queryset = self.queryset.filter(category=category)

    def _filter_by_date(self, date_filter, date_start, date_end):
        today = timezone.now().date()

        if date_filter == 'today':
            self.queryset = self.queryset.filter(
                Q(date__date=today) | 
                Q(date_end__date__gte=today, date__date__lte=today)
            )
        elif date_filter == 'tomorrow':
            tomorrow = today + timedelta(days=1)
            self.queryset = self.queryset.filter(
                Q(date__date=tomorrow) | 
                Q(date_end__date__gte=tomorrow, date__date__lte=tomorrow)
            )
        elif date_filter == 'weekend':
            days_until_saturday = (5 - today.weekday()) % 7
            if days_until_saturday == 0:
                days_until_saturday = 7
            saturday = today + timedelta(days=days_until_saturday)
            sunday = saturday + timedelta(days=1)
            self.queryset = self.queryset.filter(
                Q(date__date__in=[saturday, sunday]) |
                Q(date_end__date__in=[saturday, sunday]) |
                Q(date__date__lte=sunday, date_end__date__gte=saturday)
            )
        elif date_filter == 'week':
            week_end = today + timedelta(days=7)
            self.queryset = self.queryset.filter(
                Q(date__date__range=[today, week_end]) |
                Q(date_end__date__range=[today, week_end]) |
                Q(date__date__lte=week_end, date_end__date__gte=today)
            )
        elif date_filter == 'custom' and date_start and date_end:
            self.queryset = self.queryset.filter(
                Q(date__date__range=[date_start, date_end]) |
                Q(date_end__date__range=[date_start, date_end]) |
                Q(date__date__lte=date_end, date_end__date__gte=date_start)
            )

    def _filter_by_search(self, search):
        if search:
            self.queryset = self.queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(venue__icontains=search) |
                Q(participants__icontains=search)
            )

    def _apply_sorting(self, sort):
        if sort == 'price_asc':
            self.queryset = self.queryset.order_by('price')
        elif sort == 'price_desc':
            self.queryset = self.queryset.order_by('-price')
        else:
            self.queryset = self.queryset.order_by('date')


def get_events_data(events_queryset):
    events_data = []
    for event in events_queryset:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'category': event.get_category_display(),
            'category_code': event.category,
            'date': event.get_date_display(),
            'date_only': event.get_date_only(),
            'venue': event.venue,
            'participants': event.participants if event.participants else '',
            'description': event.description[:100] + '...' if len(event.description) > 100 else event.description,
            'price': event.get_price_display(),
            'price_value': float(event.price),
            'image': event.image.url if event.image else '',
        })
    return events_data