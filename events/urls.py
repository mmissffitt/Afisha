from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('filter-events/', views.filter_events, name='filter_events'),
    path('event/<int:event_id>/', views.event_detail, name='event_detail'),  # ЭТО ДОБАВИТЬ
    path('event/<int:event_id>/purchase/', views.purchase_ticket, name='purchase_ticket'),
    path('purchase/success/', views.purchase_success, name='purchase_success'),
]