# from django.urls import path
# from . import views

# urlpatterns = [
#     path("categories/", views.category_list_create, name="categories"),
#     path("products/", views.product_list_create, name="products"),
# ]

from django.urls import path
from . import views
#from rest_framework.routers import DefaultRouter
from .views import CategoryAPI

#router = DefaultRouter()
#outer.register(r'user',UserAPI)

urlpatterns = [
    path('',CategoryAPI.as_view(), name = 'root'),
    path('categories/',views.CategoryAPI.as_view(), name = 'category_api]'),
    path('<int:id>/',CategoryAPI.as_view(), name = 'detail'),
]
# urls.py
# urlpatterns = [
#     path('categories/', CategoryAPI.as_view(), name='api'),
#     path('categories/<int:id>/', CategoryAPI.as_view(), name='details'), # Added 'categories/' prefix
# ]