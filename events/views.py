from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from .models import Event
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.urls import reverse

def index(request):
    events = Event.objects.all()
    popular_events = Event.objects.filter(is_popular=True)[:2]
    
    context = {
        'events': events,
        'popular_events': popular_events,
    }
    return render(request, 'events/index.html', context)

def event_detail(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    context = {
        'event': event,
    }
    return render(request, 'events/event_detail.html', context)

def purchase_ticket(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        quantity = request.POST.get('quantity')
        ticket_type = request.POST.get('ticket_type')
        
        return HttpResponseRedirect(reverse('purchase_success'))
    
    context = {
        'event': event,
    }
    return render(request, 'events/purchase.html', context)

def purchase_success(request):
    return render(request, 'events/purchase_success.html')

def filter_events(request):
    if request.method == 'GET':
        category = request.GET.get('category', 'all')
        date_filter = request.GET.get('date', 'all')
        search = request.GET.get('search', '')
        date_start = request.GET.get('date_start', '')
        date_end = request.GET.get('date_end', '')
        sort = request.GET.get('sort', 'default') 
        
        events = Event.objects.all()

        if category != 'all':
            events = events.filter(category=category)

        today = timezone.now().date()
        
        if date_filter == 'today':
            events = events.filter(
                Q(date__date=today) | 
                Q(date_end__date__gte=today, date__date__lte=today)
            )
        elif date_filter == 'tomorrow':
            tomorrow = today + timedelta(days=1)
            events = events.filter(
                Q(date__date=tomorrow) | 
                Q(date_end__date__gte=tomorrow, date__date__lte=tomorrow)
            )
        elif date_filter == 'weekend':
            days_until_saturday = (5 - today.weekday()) % 7
            if days_until_saturday == 0:
                days_until_saturday = 7
            saturday = today + timedelta(days=days_until_saturday)
            sunday = saturday + timedelta(days=1)
            events = events.filter(
                Q(date__date__in=[saturday, sunday]) |
                Q(date_end__date__in=[saturday, sunday]) |
                Q(date__date__lte=sunday, date_end__date__gte=saturday)
            )
        elif date_filter == 'week':
            week_end = today + timedelta(days=7)
            events = events.filter(
                Q(date__date__range=[today, week_end]) |
                Q(date_end__date__range=[today, week_end]) |
                Q(date__date__lte=week_end, date_end__date__gte=today)
            )
        elif date_filter == 'custom' and date_start and date_end:
            events = events.filter(
                Q(date__date__range=[date_start, date_end]) |
                Q(date_end__date__range=[date_start, date_end]) |
                Q(date__date__lte=date_end, date_end__date__gte=date_start)
            )

        if search:
            events = events.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(venue__icontains=search) |
                Q(participants__icontains=search)
            )
        
        if sort == 'price_asc':
            events = events.order_by('price')
        elif sort == 'price_desc':
            events = events.order_by('-price')
        else:
            events = events.order_by('date')

        events_data = []
        for event in events:
            category_display = dict(Event.CATEGORY_CHOICES).get(event.category, event.category)
            
            events_data.append({
                'id': event.id,
                'title': event.title,
                'category': category_display,
                'category_code': event.category,
                'date': event.get_date_display(),
                'date_only': event.get_date_only(),
                'venue': event.venue,
                'participants': event.participants if event.participants else None,
                'description': event.description[:100] + '...' if len(event.description) > 100 else event.description,
                'price': event.get_price_display(),
                'price_value': event.price,
                'image': event.image.url if event.image else '',
            })
        
        return JsonResponse({'events': events_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)