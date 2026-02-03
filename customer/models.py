from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10)
    password = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    avatar = models.TextField(null=True, blank=True)  # Store base64 string directly

    telegram_chat_id = models.CharField(max_length=50, null=True, blank=True)

    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name