from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('filter-events/', views.filter_events, name='filter_events'),  # Изменено имя пути
]