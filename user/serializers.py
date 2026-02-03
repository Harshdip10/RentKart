from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # This hashes the password before it hits the DB
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)