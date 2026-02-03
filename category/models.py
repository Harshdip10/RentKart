# from django.db import models

# class Category(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     description = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name


# class Product(models.Model):
#     name = models.CharField(max_length=150)
#     description = models.TextField()
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     category = models.ForeignKey(
#         Category,
#         on_delete=models.CASCADE,
#         related_name="products"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500)

# class Product(models.Model):
#     name = models.CharField(max_length=200)
#     # Using 'self' or the string name avoids import errors
#     category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     stock = models.IntegerField()

    def __str__(self):
        return self.name