from mongoengine import Document, StringField, ReferenceField
from django.contrib.auth.models import User

class Address(Document):
    user = ReferenceField(User, required=True)
    street = StringField(required=True)
    city = StringField(required=True)
    state = StringField()  # State might be optional depending on country
    country = StringField(required=True)
    zip_code = StringField(required=True)

