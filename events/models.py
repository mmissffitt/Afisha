from django.db import models
from django.utils import timezone

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
    venue = models.CharField('Площадка', max_length=200)
    participants = models.CharField('Участники', max_length=300)
    description = models.TextField('Описание')
    price = models.CharField('Цена', max_length=100, blank=True, help_text='Например: "от 500 ₽" или "бесплатно"')
    image = models.ImageField('Изображение', upload_to='events/', blank=True, null=True)
    is_popular = models.BooleanField('Популярное', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'
        ordering = ['date']
    
    def __str__(self):
        return self.title
    
    def get_date_display(self):
        return self.date.strftime('%d %B %Y, %H:%M')
    
    def get_date_only(self):
        return self.date.strftime('%d %B %Y')