# reviews/views.py

from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action

from mongoengine.queryset.visitor import Q

from .models import Review
from products.models import Product
from authentication.models import User
from .serializers import ReviewSerializer

class ReviewViewSet(ViewSet):
    serializer_class = ReviewSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        if not product_id or rating is None:
            return Response({"detail": "product_id and rating are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate rating
        try:
            rating = int(rating)
            if not 1 <= rating <= 5:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"detail": "Rating must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Optional: Check if user has already reviewed this product
        existing_review = Review.objects.filter(user=user.id, product=product.id).first()
        if existing_review:
             return Response({"detail": "You have already reviewed this product."}, status=status.HTTP_400_BAD_REQUEST)


        review = Review(
            user=user.id,
            product=product.id,
            rating=rating,
            comment=comment
        )
        review.status = 'pending'  # Explicitly set status to pending
        review.save()

        # Update product's average rating and review count
        product.review_count = Review.objects.filter(product=product.id).count()
        # Only include approved reviews in average rating calculation
        approved_reviews = Review.objects.filter(product=product.id, status='approved')
        total_rating = sum(review.rating for review in approved_reviews)
        if product.review_count > 0:
            # Calculate average rating based on approved reviews
            product.average_rating = total_rating / approved_reviews.count() if approved_reviews.count() > 0 else 0.0
        product.save()

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request):
        product_id = request.query_params.get('product_id')

        # Basic admin check (replace with your actual admin check logic)
        is_admin = request.user.is_staff if hasattr(request.user, 'is_staff') else False

        reviews_queryset = Review.objects

        if not product_id:
            return Response({"detail": "product_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if product exists (optional but good practice)
        try:
             Product.objects.get(id=product_id)
        except Product.DoesNotExist:
             return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)


        reviews_queryset = reviews_queryset.filter(product=product_id)
        if not is_admin:
            reviews_queryset = reviews_queryset.filter(status='approved')
        reviews = reviews_queryset.order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        user = request.user
        
        try:
            review = Review.objects.get(id=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the review belongs to the authenticated user
        if str(review.user.id) != str(user.id):
             return Response({"detail": "You do not have permission to edit this review."}, status=status.HTTP_403_FORBIDDEN)

        # Update allowed fields
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        if rating is not None:
            try:
                rating = int(rating)
                if not 1 <= rating <= 5:
                    raise ValueError
                review.rating = rating
            except (ValueError, TypeError):
                 return Response({"detail": "Rating must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        if comment is not None:
            review.comment = comment

        review.save()

        # Recalculate product's average rating and review count
        product = review.product.fetch() # Get the updated product object
        product.review_count = Review.objects.filter(product=product.id).count()
        
        # Only recalculate average rating if the review is currently approved
        if review.status == 'approved':
            approved_reviews = Review.objects.filter(product=product.id, status='approved')
            total_rating = sum(r.rating for r in approved_reviews)
            product.average_rating = total_rating / approved_reviews.count() if approved_reviews.count() > 0 else 0.0
            product.save()

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        user = request.user

        try:
            review = Review.objects.get(id=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the review belongs to the authenticated user
        if str(review.user.id) != str(user.id):
            return Response({"detail": "You do not have permission to delete this review."}, status=status.HTTP_403_FORBIDDEN)

        product = review.product.fetch() # Get the related product object

        # Delete the review
        review.delete()

        # Recalculate product's average rating and review count
        product.review_count = Review.objects.filter(product=product.id).count()
        total_rating = sum(r.rating for r in Review.objects.filter(product=product.id))
        product.average_rating = total_rating / product.review_count if product.review_count > 0 else 0.0
        product.save()

        return Response(status=status.HTTP_204_NO_CONTENT)