from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField
from datetime import datetime
from authentication.models import User
from products.models import Product

class Review(Document):
    user = ReferenceField(User, required=True)
    product = ReferenceField(Product, required=True)
    rating = IntField(min_value=1, max_value=5, required=True)
    comment = StringField(null=True)
    status = StringField(choices=['pending', 'approved', 'rejected'], default='pending')
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'indexes': [
            'user',
            'product',
            'status',
        ]
    }