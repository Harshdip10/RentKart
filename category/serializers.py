# from rest_framework import serializers
# from .models import Category, Product

# class CategorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Category
#         fields = ['id', 'name', 'description', 'created_at']


# class ProductSerializer(serializers.ModelSerializer):
#     # Show category name along with ID
#     category_name = serializers.CharField(source='category.name', read_only=True)

#     class Meta:
#         model = Product
#         fields = ['id', 'name', 'description', 'price', 'category', 'category_name', 'created_at']

from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category 
        fields = "__all__"