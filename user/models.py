from django.db import models

# Create your models here.
class User(models.Model):
    name = models.CharField(max_length = 100)
    email = models.EmailField(unique = True)
    phone = models.CharField(max_length=10)
    password = models.CharField(max_length=20, default="")

    telegram_chat_id = models.CharField(max_length=50, null=True, blank=True)

    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name

# from django.db import models
# from django.contrib.auth.hashers import make_password

# class User(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField(unique=True)
#     phone = models.CharField(max_length=10)
#     # Passwords should be stored as long hashes
#     password = models.CharField(max_length=128) 
#    # telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
#     def __str__(self):
#         return self.name