from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subscription
from .serializers import SubscriptionSerializer
from product.models import Product
from product.serializers import ProductSerializer

class SubscriptionAPI(APIView):

    # Get all subscriptions or a single subscription
    def get(self, request, id=None):
        if id:
            try:
                sub = Subscription.objects.get(id=id)
                serializer = SubscriptionSerializer(sub)
                return Response(serializer.data)
            except Subscription.DoesNotExist:
                return Response({"error": "Subscription not found"}, status=status.HTTP_404_NOT_FOUND)

        subs = Subscription.objects.all()
        serializer = SubscriptionSerializer(subs, many=True)
        return Response(serializer.data)

    # Add new subscription
    def post(self, request):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Edit subscription
    def put(self, request, id=None):
        try:
            sub = Subscription.objects.get(id=id)
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubscriptionSerializer(sub, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete subscription
    def delete(self, request, id=None):
        try:
            sub = Subscription.objects.get(id=id)
            sub.delete()
            return Response({"message": "Subscription deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=status.HTTP_404_NOT_FOUND)


# API to fetch products for dropdown
class ProductListAPI(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
