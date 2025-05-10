from django.contrib import admin
from .models import Product

# Temporarily commented out as Product is a mongoengine Document
# @admin.register(Product)
# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'price', 'inventory')
#     search_fields = ('name',)
