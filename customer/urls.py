from django.urls import path
from .views import (
    CustomerAPI, 
    LoginAPI, 
    ForgotPasswordAPI,
    TelegramWebhook,
    LinkTelegramAPI,
    SendOTPTelegramAPI, 
    VerifyTelegramOTP
)

urlpatterns = [
    path('', CustomerAPI.as_view(), name='root'),
    path('customer/', CustomerAPI.as_view(), name='customer_api'),
    path('<int:id>/', CustomerAPI.as_view(), name='detail'),
    
    # Authentication endpoints
    path('login/', LoginAPI.as_view(), name='login'),
    path('forgotpassword/', ForgotPasswordAPI.as_view(), name='forgot_password'),
    
    # Telegram integration endpoints
    path('telegram-webhook/', TelegramWebhook.as_view(), name='telegram_webhook'),
    path('link-telegram/', LinkTelegramAPI.as_view(), name='link_telegram'),
    path('send-otp-telegram/', SendOTPTelegramAPI.as_view(), name='send_otp_telegram'),
    path('verify-telegram-otp/', VerifyTelegramOTP.as_view(), name='verify_telegram_otp'),
]