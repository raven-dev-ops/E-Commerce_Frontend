from django.db import models
from django.conf import settings
from products.models import Product
from mongoengine import Document, EmbeddedDocument, fields

class CartItem(EmbeddedDocument):
    product_id = fields.StringField(required=True) # To store the MongoDB ObjectId as a string
    quantity = fields.IntField(required=True, min_value=1)

class Cart(Document):
    user = fields.IntField(required=True) # To store the Django user ID
    items = fields.ListField(fields.EmbeddedDocumentField(CartItem))


ORDER_STATUS_CHOICES = [
    ('pending', 'Pending Payment'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('canceled', 'Canceled'),
    ('failed', 'Payment Failed'),
]
class Order(Document):
    user = fields.IntField(required=True) # To store the Django user ID
    created_at = fields.DateTimeField(required=True)
    total_price = fields.DecimalField(required=True)
    shipping_cost = fields.DecimalField(default=0.0)
    tax_amount = fields.DecimalField(default=0.0)
    payment_intent_id = fields.StringField() # To store the Stripe PaymentIntent ID
    status = fields.StringField(choices=ORDER_STATUS_CHOICES, default='pending')
    items = fields.ListField(fields.EmbeddedDocumentField(OrderItem))

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.CharField(max_length=24)  # To store the MongoDB ObjectId as a string
    quantity = models.PositiveIntegerField()