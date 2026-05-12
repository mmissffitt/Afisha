from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from .models import Event, Order
from .forms import OrderForm
from .services import EventFilter, get_events_data


def index(request):
    events = Event.objects.all()[:6]
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
        form = OrderForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.event = event
            order.total_price = event.price * order.quantity
            order.save()
            return HttpResponseRedirect(reverse('purchase_success'))
    else:
        form = OrderForm()
    
    context = {
        'event': event,
        'form': form,
    }
    return render(request, 'events/purchase.html', context)


def purchase_success(request):
    return render(request, 'events/purchase_success.html')


def filter_events(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    category = request.GET.get('category', 'all')
    date_filter = request.GET.get('date', 'all')
    search = request.GET.get('search', '')
    date_start = request.GET.get('date_start', '')
    date_end = request.GET.get('date_end', '')
    sort = request.GET.get('sort', 'default')
    
    event_filter = EventFilter()
    filtered_events = event_filter.apply_filters(
        category=category,
        date_filter=date_filter,
        search=search,
        date_start=date_start,
        date_end=date_end,
        sort=sort
    )
    
    events_data = get_events_data(filtered_events)
    return JsonResponse({'events': events_data})