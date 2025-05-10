from rest_framework import serializers
from .models import Review
from authentication.models import User
from products.models import Product


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    product = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'comment', 'created_at', 'status']
        read_only_fields = ['id', 'user', 'product', 'created_at', 'status']