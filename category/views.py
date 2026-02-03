# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json

# from .models import Category, Product
# @csrf_exempt
# def category_list_create(request):
#     if request.method == "GET":
#         categories = Category.objects.all().values()
#         return JsonResponse(list(categories), safe=False)

#     if request.method == "POST":
#         data = json.loads(request.body)
#         category = Category.objects.create(
#             name=data["name"],
#             description=data.get("description", "")
#         )
#         return JsonResponse({
#             "message": "Category created successfully",
#             "id": category.id
#         })
# @csrf_exempt
# def product_list_create(request):
#     if request.method == "GET":
#         products = Product.objects.select_related("category").all()
#         data = []

#         for product in products:
#             data.append({
#                 "id": product.id,
#                 "name": product.name,
#                 "description": product.description,
#                 "price": float(product.price),
#                 "category": product.category.name,
#                 "category_id": product.category.id,
#                 "created_at": product.created_at
#             })

#         return JsonResponse(data, safe=False)

#     if request.method == "POST":
#         data = json.loads(request.body)
#         category = Category.objects.get(id=data["category_id"])

#         product = Product.objects.create(
#             name=data["name"],
#             description=data["description"],
#             price=data["price"],
#             category=category
#         )

#         return JsonResponse({
#             "message": "Product created successfully",
#             "id": product.id
#         })

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .models import Category
from .serializers import CategorySerializer

class CategoryAPI(APIView):
    def post(self, request, id=None):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Fixed typo: stats -> status
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, id=None):
        if id:
            try:
                # Fixed typo: object -> objects
                category = Category.objects.get(id=id)
                serializer = CategorySerializer(category)
                return Response(serializer.data)
            except Category.DoesNotExist:
                return Response({"error": "Category Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def put(self, request, id=None):
        try:
            # Changed 'customer' to 'category' for clarity
            category = Category.objects.get(id=id)
        except Category.DoesNotExist:
            return Response({"error": "Category Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Pass the instance (category) and the data to the serializer
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        try:
            category = Category.objects.get(id=id)
            category.delete()
            return Response({"message": "Category Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Category.DoesNotExist:
            return Response({"error": "Category Not Found"}, status=status.HTTP_404_NOT_FOUND)