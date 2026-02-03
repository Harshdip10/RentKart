from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Product
from .serializers import ProductSerializer

class ProductAPI(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request, id=None):
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        if id:
            try:
                product = Product.objects.get(id=id)
                serializer = ProductSerializer(product, context={'request': request})
                return Response(serializer.data)
            except Product.DoesNotExist:
                return Response({"error": "Product Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    def put(self, request, id=None):
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response({"error": "Product Not Found"}, status=status.HTTP_404_NOT_FOUND)

        # Handle image removal - if 'image' is empty string, delete the image
        if 'image' in request.data and request.data['image'] == '':
            if product.image:
                product.image.delete(save=False)
            request.data._mutable = True if hasattr(request.data, '_mutable') else False
            request.data.pop('image', None)

        # Handle partial updates (PATCH-like behavior)
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        try:
            product = Product.objects.get(id=id)
            # Delete the image file if it exists
            if product.image:
                product.image.delete(save=False)
            product.delete()
            return Response({"message": "Product Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({"error": "Product Not Found"}, status=status.HTTP_404_NOT_FOUND)