from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import Address

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')


class AddressSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Address
        fields = ('user', 'street', 'city', 'state', 'country', 'zip_code')
        read_only_fields = ('user',)