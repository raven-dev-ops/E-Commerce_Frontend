from mongoengine import Document, StringField, FloatField, ListField, DictField, BooleanField

class Product(Document):
    product_name = StringField(max_length=255)
    category = StringField(max_length=100)
    description = StringField()
    price = FloatField()
    ingredients = ListField(StringField(max_length=255))
    benefits = ListField(StringField(max_length=255))
    scent_profile = StringField(max_length=255, required=False)
    variants = ListField(DictField(), default=list)
    tags = ListField(StringField(max_length=255))
    availability = BooleanField(default=True)

    def __str__(self):
        return self.product_name
