"""
authentication/serializers.py

Serializers convert Python objects (like User) to JSON format
so the frontend (React) can read the data.

Think of serializers as a translator between Python and JSON.
"""

from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Accepts: full_name, email, password, confirm_password
    """

    # Extra fields not in the User model by default
    full_name = serializers.CharField(max_length=150)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # These fields will be accepted in the request body
        fields = ['full_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True}  # Never return password in response
        }

    def validate(self, data):
        """
        Custom validation:
        1. Check that passwords match
        2. Check that email is not already registered
        """
        # Check password match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")

        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return data

    def create(self, validated_data):
        """
        Create and return a new User after removing confirm_password.
        """
        # We don't store confirm_password in the database
        validated_data.pop('confirm_password')
        full_name = validated_data.pop('full_name')

        # Django requires a username — we'll use the email as username
        user = User.objects.create_user(
            username=validated_data['email'],   # email as username (unique)
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=full_name,               # Store full name in first_name
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to return basic user info.
    Used after login to tell the frontend who is logged in.
    """

    # Return full_name mapped from first_name field
    full_name = serializers.CharField(source='first_name')

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']
