from django.shortcuts import render
from django.http import JsonResponse
from .models import Event
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

def index(request):
    events = Event.objects.all()
    popular_events = Event.objects.filter(is_popular=True)[:2]
    
    context = {
        'events': events,
        'popular_events': popular_events,
    }
    return render(request, 'events/index.html', context)

def filter_events(request):
    if request.method == 'GET':
        category = request.GET.get('category', 'all')
        date_filter = request.GET.get('date', 'all')
        search = request.GET.get('search', '')
        
        events = Event.objects.all()
        
        # Фильтр по категории
        if category != 'all':
            events = events.filter(category=category)
        
        # Фильтр по дате
        today = timezone.now().date()
        
        if date_filter == 'today':
            events = events.filter(date__date=today)
        elif date_filter == 'tomorrow':
            tomorrow = today + timedelta(days=1)
            events = events.filter(date__date=tomorrow)
        elif date_filter == 'weekend':
            # Находим ближайшие выходные
            days_until_saturday = (5 - today.weekday()) % 7
            if days_until_saturday == 0:  # Если сегодня суббота
                days_until_saturday = 0
            saturday = today + timedelta(days=days_until_saturday)
            sunday = saturday + timedelta(days=1)
            events = events.filter(date__date__in=[saturday, sunday])
        elif date_filter == 'week':
            week_end = today + timedelta(days=7)
            events = events.filter(date__date__range=[today, week_end])
        
        # ПОИСК - исправленная часть
        if search:
            events = events.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(venue__icontains=search) |
                Q(participants__icontains=search)
            )
        
        # Подготовка данных для JSON ответа
        events_data = []
        for event in events:
            # Форматируем дату правильно
            date_str = event.date.strftime('%d %B %Y, %H:%M')
            date_only_str = event.date.strftime('%d %B %Y')
            
            # Правильно получаем название категории на русском
            category_display = dict(Event.CATEGORY_CHOICES).get(event.category, event.category)
            
            events_data.append({
                'id': event.id,
                'title': event.title,
                'category': category_display,
                'category_code': event.category,
                'date': date_str,
                'date_only': date_only_str,
                'venue': event.venue,
                'participants': event.participants,
                'description': event.description,
                'price': event.price if event.price else 'бесплатно',
                'image': event.image.url if event.image else '',
            })
        
        return JsonResponse({'events': events_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)