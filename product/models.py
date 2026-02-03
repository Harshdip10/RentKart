from django.db import models
from category.models import Category  # Import Category model

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=500)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    @property
    def image_url(self):
        """Return the image URL if exists, otherwise return None"""
        if self.image:
            return self.image.url
        return None