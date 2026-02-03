from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .models import Customer
from .serializers import CustomerSerializer
from django.contrib.auth.hashers import check_password
from django.conf import settings
import random
import requests
from django.utils.timezone import now
from datetime import timedelta

class CustomerAPI(APIView):
    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        if id:
            try:
                customer = Customer.objects.get(id=id)
            except Customer.DoesNotExist:
                return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = CustomerSerializer(customer)
            return Response(serializer.data)

        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def put(self, request, id=None):
        try:
            customer = Customer.objects.get(id=id)
        except Customer.DoesNotExist:
            return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            customer = Customer.objects.get(id=id)
            customer.delete()
            return Response({"message": "Customer Deleted"}, status=status.HTTP_204_NO_CONTENT)
        except Customer.DoesNotExist:
            return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

class LoginAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not check_password(password, customer.password):
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {
                "message": "Login successful",
                "customer_id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "avatar": customer.avatar
            },
            status=status.HTTP_200_OK
        )

class ForgotPasswordAPI(APIView):
    """Simple password reset without OTP (keep for backward compatibility)"""
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        if not email or not new_password:
            return Response(
                {"error": "Email and new password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        customer.set_password(new_password)
        customer.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )

class TelegramWebhook(APIView):
    """Handle incoming messages from Telegram bot"""
    def post(self, request):
        data = request.data
        
        # Correct data extraction from Telegram webhook payload
        message = data.get('message', {})
        chat_id = message.get('chat', {}).get('id')
        text = message.get('text', '')

        if text.startswith("/start"):
            parts = text.split()
            if len(parts) == 2:
                phone = parts[1]

                try:
                    customer = Customer.objects.get(phone=phone)
                    customer.telegram_chat_id = str(chat_id)
                    customer.save()
                    
                    # Send confirmation message to user
                    send_telegram_message(
                        chat_id,
                        f"✅ Account linked successfully!\n\nHello {customer.name}, your Telegram account is now connected."
                    )
                    
                    return Response({"message": "Telegram linked successfully"})
                except Customer.DoesNotExist:
                    send_telegram_message(
                        chat_id,
                        "❌ Account not found. Please check your phone number and try again."
                    )

        return Response({"status": "ok"})

def send_telegram_message(chat_id, message):
    """Helper function to send messages via Telegram Bot API"""
    BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"  # Allow HTML formatting
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.json()
    except requests.RequestException as e:
        print(f"Failed to send Telegram message: {e}")
        return None

class LinkTelegramAPI(APIView):
    """Generate a link for users to connect their Telegram account"""
    def post(self, request):
        email = request.data.get("email")
        phone = request.data.get("phone")

        if not email or not phone:
            return Response(
                {"error": "Email and phone required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(email=email, phone=phone)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate the bot link with phone as parameter
        bot_username = "Rentkart_bot"  # Replace with your actual bot username
        telegram_link = f"https://t.me/{bot_username}?start={phone}"

        return Response({
            "message": "Please click the link to connect your Telegram account",
            "telegram_link": telegram_link,
            "bot_username": bot_username
        }, status=status.HTTP_200_OK)

class SendOTPTelegramAPI(APIView):
    """Send OTP to user's Telegram account"""
    def post(self, request):
        email = request.data.get("email")
        mobile = request.data.get("mobile")

        if not email or not mobile:
            return Response(
                {"error": "Email and mobile required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(email=email, phone=mobile)
        except Customer.DoesNotExist:
            return Response(
                {"error": "No customer found with this email and mobile"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if not customer.telegram_chat_id:
            return Response(
                {
                    "error": "Telegram account not linked",
                    "message": "Please link your Telegram account first using /start command"
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        customer.otp = otp
        customer.otp_created_at = now()
        customer.save()

        # Send OTP via Telegram
        message = f"""
🔐 <b>Password Reset OTP</b>

Your OTP code is: <code>{otp}</code>

This code will expire in 5 minutes.

If you didn't request this, please ignore this message.
        """
        
        result = send_telegram_message(customer.telegram_chat_id, message)
        
        if result:
            return Response(
                {"message": "OTP sent to Telegram successfully"}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Failed to send OTP. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyTelegramOTP(APIView):
    """Verify OTP and reset password"""
    def post(self, request):
        email = request.data.get("email")
        mobile = request.data.get("mobile")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not all([email, mobile, otp, new_password]):
            return Response(
                {"error": "All fields required (email, mobile, otp, new_password)"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            customer = Customer.objects.get(email=email, phone=mobile)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if not customer.otp:
            return Response(
                {"error": "No OTP generated. Please request OTP first."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if customer.otp != otp:
            return Response(
                {"error": "Invalid OTP"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if OTP is expired (5 minutes)
        if now() - customer.otp_created_at > timedelta(minutes=5):
            return Response(
                {"error": "OTP expired. Please request a new one."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reset password
        customer.set_password(new_password)
        customer.otp = None
        customer.otp_created_at = None
        customer.save()

        # Send confirmation via Telegram
        if customer.telegram_chat_id:
            send_telegram_message(
                customer.telegram_chat_id,
                "✅ Your password has been reset successfully!"
            )

        return Response(
            {"message": "Password reset successful"}, 
            status=status.HTTP_200_OK
        )