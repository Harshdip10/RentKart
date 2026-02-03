from django.contrib import admin
from .models import Customer

# Register your models here.
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'address', 'telegram_chat_id']
    search_fields = ['name', 'email', 'phone']
    list_filter = ['telegram_chat_id']