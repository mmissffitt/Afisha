from django.db import models
from django.utils import timezone
from django.urls import reverse

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('music', 'Музыка'),
        ('theatre', 'Театр'),
        ('art', 'Искусство'),
        ('sport', 'Спорт'),
        ('exhibitions', 'Выставки'),
    ]
    
    title = models.CharField('Название', max_length=200)
    category = models.CharField('Категория', max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateTimeField('Дата и время')
    date_end = models.DateTimeField('Дата окончания', blank=True, null=True, help_text='Для выставок и фестивалей')
    venue = models.CharField('Площадка', max_length=200)
    address = models.CharField('Адрес', max_length=300, default='Сургут, ул. Ленина')
    participants = models.CharField('Участники', max_length=300, blank=True, null=True, help_text='Можно не указывать для выставок')
    description = models.TextField('Описание')
    price = models.IntegerField('Цена (в рублях)', default=0, help_text='Базовая цена билета')
    image = models.ImageField('Изображение', upload_to='events/', blank=True, null=True)
    is_popular = models.BooleanField('Популярное', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'
        ordering = ['date']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('event_detail', args=[str(self.id)])
    
    def get_date_display(self):
        if self.date_end:
            if self.date.strftime('%H:%M') == self.date_end.strftime('%H:%M'):
                return f"{self.date.strftime('%d.%m.%Y')} - {self.date_end.strftime('%d.%m.%Y')} {self.date.strftime('%H:%M')}"
            else:
                return f"{self.date.strftime('%d.%m.%Y')} - {self.date_end.strftime('%d.%m.%Y')}"
        return self.date.strftime('%d.%m.%Y %H:%M')
    
    def get_date_only(self):
        if self.date_end:
            return f"{self.date.strftime('%d.%m.%Y')} - {self.date_end.strftime('%d.%m.%Y')}"
        return self.date.strftime('%d.%m.%Y')
    
    def get_price_display(self):
        if self.price == 0:
            return 'бесплатно'
        return f'от {self.price} ₽'