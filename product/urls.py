from django.urls import path
from . import views
from .views import ProductAPI

urlpatterns = [
    path('',ProductAPI.as_view(),name='root'),
    path('product/', ProductAPI.as_view(), name='product_list'),
    path('<int:id>/', ProductAPI.as_view(), name='product_detail'),
]
