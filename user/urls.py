from django.urls import path
from . import views
#from rest_framework.routers import DefaultRouter
from .views import UserAPI, LoginAPI, ForgotPasswordAPI
from .views import TelegramWebhook
from .views import SendOTPTelegramAPI, VerifyTelegramOTP

#router = DefaultRouter()
#outer.register(r'user',UserAPI)

urlpatterns = [
    path('',UserAPI.as_view(), name = 'root'),
    path('user/',views.UserAPI.as_view(), name = 'user_api'),
    path('<int:id>/',UserAPI.as_view(), name = 'detail'),
    path('login/', LoginAPI.as_view()),
    path('forgotpassword/', ForgotPasswordAPI.as_view()),
    path('telegram-webhook/', TelegramWebhook.as_view()),
    path('send-otp-telegram/', SendOTPTelegramAPI.as_view()),
    path('verify-telegram-otp/', VerifyTelegramOTP.as_view()),
]

