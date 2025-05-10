from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
import stripe
from .models import Cart, CartItem, Order, OrderItem
from products.models import Product # Import Product model to validate product_id
from .serializers import CartSerializer, CartItemSerializer
from .serializers import OrderSerializer # Import OrderSerializer
# Create your views here.

class CartViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        # Assuming user is authenticated and user ID is available in request.user.id
        # You might need to adjust this based on your authentication setup
        user_id = request.user.id if request.user.is_authenticated else None
        if not user_id:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        cart, created = Cart.objects.get_or_create(user=user_id)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        user_id = request.user.id if request.user.is_authenticated else None
        if not user_id:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Validate if product_id exists in Product model
        try:
            Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        cart, created = Cart.objects.get_or_create(user=user_id)

        # Check if the item is already in the cart
        for item in cart.items:
            if str(item.product_id) == str(product_id):
                item.quantity += quantity
                break
        else:
            # Item not in cart, add new item
            cart_item = CartItem(product_id=product_id, quantity=quantity)
            cart.items.append(cart_item)

        cart.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderViewSet(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request):
        user = request.user
        # We are already checking authentication with permission_classes = [IsAuthenticated]

        # Retrieve the user's cart
        cart = Cart.objects.filter(user=user.id).first()
        if not cart or not cart.items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming request data might contain payment details, but we'll add a placeholder
        payment_details = request.data.get('payment_details') # Example: dictionary with card info, etc.

        # Create OrderItems from CartItems
        order_items = []
        total_price = 0
        subtotal = 0
        for item in cart.items:
            # Fetch the product to get the current price and ensure it exists
            try:
                product = Product.objects.get(id=item.product_id)
            except Product.DoesNotExist:
                # Handle case where product in cart doesn't exist anymore
                return Response({"detail": f"Product with ID {item.product_id} not found."}, status=status.HTTP_404_NOT_FOUND)

            order_item = OrderItem(
                product=str(item.product_id),  # Store product_id as string
                quantity=item.quantity,
                price=product.price # Use the current product price
            )
            order_items.append(order_item)
            subtotal += product.price * item.quantity

        # Placeholder for shipping and tax calculation
        shipping_cost = 5.00  # Flat rate shipping
        tax_rate = 0.08  # 8% tax
        tax_amount = round(subtotal * tax_rate, 2) # Calculate tax based on subtotal

        # Calculate total price including shipping and tax
        total_price = subtotal + shipping_cost + tax_amount

        # Stripe payment processing
        payment_method_id = request.data.get('payment_method_id')

        if not payment_method_id:
             return Response({"detail": "Payment method ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create a PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=int(total_price * 100),
 # Stripe uses cents
                currency='usd',  # Or your currency
                payment_method=payment_method_id,
                confirmation_method='manual',
                confirm=True,
            )

            if intent.status != 'succeeded':
                 return Response({"detail": f"Payment failed: {intent.last_payment_error.message}"}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Create the Order
        # Create the Order
        order = Order(user=user.id, items=order_items, total_price=total_price, shipping_cost=shipping_cost, tax_amount=tax_amount)
        order.save()

        # Clear the user's cart after creating the order
        cart.items = []
        cart.save()
        order.payment_intent_id = intent.id # Store the PaymentIntent ID

        # Serialize the created order and return it
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        # Retrieve all orders for the authenticated user
        orders = Order.objects.filter(user=user.id)

        # Serialize the orders
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        user_id = request.user.id if request.user.is_authenticated else None
        if not user_id:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        product_id = request.data.get('product_id')

        cart = Cart.objects.filter(user=user_id).first()
        if not cart:
            return Response({"detail": "Cart not found."}, status=status.HTTP_404_NOT_FOUND)

        # Remove the item from the cart
        initial_item_count = len(cart.items)
        cart.items = [item for item in cart.items if str(item.product_id) != str(product_id)]

        if len(cart.items) == initial_item_count:
            return Response({"detail": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND)

        cart.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            order = Order.objects.get(id=pk)
            if order.user != user.id:
                raise PermissionDenied("You do not have permission to access this order.")
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied:
             return Response({"detail": "You do not have permission to access this order."}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # You might want to add additional permission checks here, e.g., IsAdminUser
        # For now, we'll allow the user who owns the order to update status (not typical for e-commerce)
        # or you would restrict this endpoint to admin users.

        try:
            order = Order.objects.get(id=pk)
            # Optional: Check if order.user == user.id if only owner can update status

            new_status = request.data.get('status')
            if new_status:
                order.status = new_status # Assuming 'status' is a field in your Order model
                order.save()
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({"detail": "Status field is required in the request data."}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

