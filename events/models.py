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

    title = models.CharField(max_length=200, verbose_name='Название')
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        verbose_name='Категория'
    )
    description = models.TextField(verbose_name='Описание')
    date = models.DateTimeField(verbose_name='Дата и время')
    date_end = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='Дата окончания'
    )
    venue = models.CharField(max_length=200, verbose_name='Место проведения')
    address = models.TextField(verbose_name='Адрес')
    how_to_get = models.TextField(
        default='', 
        blank=True, 
        verbose_name='Как добраться'
    )
    participants = models.CharField(
        max_length=300, 
        blank=True,         # <-- ВОТ ЭТО ВАЖНО: разрешает пустые строки
        verbose_name='Участники'
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name='Цена'
    )
    image = models.ImageField(
        upload_to='events/', 
        null=True, 
        blank=True, 
        verbose_name='Изображение'
    )
    is_popular = models.BooleanField(
        default=False, 
        verbose_name='Популярное событие'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'
        ordering = ['date']

    def __str__(self):
        return self.title

    def get_category_display(self):
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)

    def get_date_display(self):
        if self.date_end:
            return f"{self.date.strftime('%d.%m.%Y %H:%M')} - {self.date_end.strftime('%d.%m.%Y %H:%M')}"
        return self.date.strftime('%d.%m.%Y %H:%M')

    def get_date_only(self):
        return self.date.strftime('%d.%m.%Y')

    def get_price_display(self):
        if self.price == 0:
            return 'Бесплатно'
        return f'{self.price:,.0f} ₽'.replace(',', ' ')

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает оплаты'),
        ('paid', 'Оплачен'),
        ('cancelled', 'Отменён'),
    ]

    event = models.ForeignKey(
        Event, 
        on_delete=models.CASCADE, 
        related_name='orders',
        verbose_name='Событие'
    )
    customer_name = models.CharField(max_length=100, verbose_name='Имя покупателя')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    quantity = models.PositiveIntegerField(
        default=1, 
        verbose_name='Количество билетов'
    )
    total_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        verbose_name='Общая стоимость'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='Статус'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Дата создания'
    )

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заказ №{self.id} - {self.customer_name}'

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.event.price * self.quantity
        super().save(*args, **kwargs)