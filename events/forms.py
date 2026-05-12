from django import forms
from .models import Order


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['customer_name', 'email', 'phone', 'quantity']
        labels = {
            'customer_name': 'Ваше имя',
            'email': 'Email',
            'phone': 'Телефон',
            'quantity': 'Количество билетов',
        }
        widgets = {
            'customer_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Иван Иванов'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'example@mail.ru'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+7 (999) 123-45-67'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'min': '1', 'max': '10'}),
        }

    def clean_quantity(self):
        quantity = self.cleaned_data['quantity']
        if quantity < 1:
            raise forms.ValidationError('Количество билетов не может быть меньше 1')
        if quantity > 10:
            raise forms.ValidationError('Максимальное количество билетов — 10')
        return quantity

    def clean_phone(self):
        phone = self.cleaned_data['phone']
        # Простая валидация телефона
        cleaned_phone = ''.join(filter(str.isdigit, phone))
        if len(cleaned_phone) < 10:
            raise forms.ValidationError('Введите корректный номер телефона (минимум 10 цифр)')
        return phone