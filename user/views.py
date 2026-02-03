from urllib import request
from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .models import User
from .serializers import UserSerializer
# Import this for the login check
from django.contrib.auth.hashers import check_password
#import requests
import random
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from datetime import timedelta
from django.utils.timezone import now

class UserAPI(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # If adding fails, this will return the exact reason (e.g., "Email already exists")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None):
        if id:
            try:
                user = User.objects.get(id=id)
            except User.DoesNotExist:
                return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = UserSerializer(user)
            return Response(serializer.data)

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def put(self, request, id=None):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

        # Added partial=True so you don't HAVE to send the password every time you update a name/phone
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
            user.delete()
            return Response({"message": "User Deleted"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': "Not Found"}, status=status.HTTP_404_NOT_FOUND)

class LoginAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Simple password check (since you're not hashing yet)
        if user.password != password:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {
                "message": "Login successful",
                "user_id": user.id,
                "name": user.name
            },
            status=status.HTTP_200_OK
        )
class ForgotPasswordAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        if not email or not new_password:
            return Response(
                {"error": "Email and new password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user.password = new_password
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )

class TelegramWebhook(APIView):
    def post(self, request):
        data = request.data

        #chat_id = data["message"]["chat"]["id"]
        chat_id = data['id']
        text = data["message"]["text"]

        if text.startswith("/start"):
            parts = text.split()
            if len(parts) == 2:
                phone = parts[1]

                try:
                    user = User.objects.get(phone=phone)
                    user.telegram_chat_id = chat_id
                    user.save()
                    return Response({"message": "Telegram linked successfully"})
                except User.DoesNotExist:
                    pass

        return Response({"status": "ok"})

def send_telegram_message(chat_id, message):
    BOT_TOKEN = "8516971237:AAGTsm-OTRg2Q35e7COB4ljQnlP65-EqJAI"
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": chat_id,
        "text": message
    }

    request.post(url, json=payload)

class SendOTPTelegramAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        mobile = request.data.get("mobile")

        if not email or not mobile:
            return Response({"error": "Email and mobile required"}, status=400)

        try:
            user = User.objects.get(email=email, phone=mobile)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email and mobile"}, status=404)

        if not user.telegram_chat_id:
            return Response({"error": "User has not started Telegram bot yet"}, status=400)

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.otp_created_at = now()
        user.save()

        send_telegram_message(
            user.telegram_chat_id,
            f"Your OTP for password reset is: {otp}"
        )

        return Response({"message": "OTP sent to Telegram"}, status=200)

    
class VerifyTelegramOTP(APIView):
    def post(self, request):
        email = request.data.get("email")  # Add email
        mobile = request.data.get("mobile")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not all([mobile, otp, new_password]):
            return Response({"error": "All fields required"}, status=400)

        try:
            # Search by both email and phone for consistency
            user = User.objects.get(email=email, phone=mobile)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if not user.otp:
            return Response({"error": "No OTP generated. Please request OTP first."}, status=400)

        if user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if now() - user.otp_created_at > timedelta(minutes=5):
            return Response({"error": "OTP expired"}, status=400)

        user.password = new_password
        user.otp = None
        user.otp_created_at = None
        user.save()

        return Response({"message": "Password reset successful"}, status=200)
    