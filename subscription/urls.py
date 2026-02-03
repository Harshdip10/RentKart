from django.urls import path
from . import views
from .views import SubscriptionAPI, ProductListAPI

urlpatterns = [
    path('', SubscriptionAPI.as_view(), name='root'),
    path('<int:id>/', SubscriptionAPI.as_view(), name='subscription_detail'),
    path('product/', ProductListAPI.as_view(), name='product_list_for_subscription'),
]

