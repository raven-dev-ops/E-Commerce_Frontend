'use client';

import React, { useState, useEffect } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import FallbackImage from '@/components/FallbackImage';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/product';

// Add this star component
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`inline w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <title>{i <= rating ? 'Gold star' : 'Empty star'}</title>
        <polygon points="9.9,1.1 12.3,6.9 18.7,7.6 13.8,11.9 15.2,18.1 9.9,14.6 4.6,18.1 6,11.9 1.1,7.6 7.5,6.9" />
      </svg>
    );
  }
  return <span>{stars}</span>;
}

// Carousel placeholder component
function CategoryCarousel({ products }: { products: Product[] }) {
  if (!products?.length) return null;
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">More in this Category</h2>
      <div className="flex overflow-x-auto gap-4 pb-2">
        {products.map(prod => (
          <div key={String(prod._id)} className="min-w-[180px] bg-white rounded shadow p-2 flex flex-col items-center">
            <FallbackImage
              src={getPublicImageUrl(prod.images?.[0])}
              alt={prod.product_name}
              width={120}
              height={150}
              className="object-cover rounded mb-2"
              unoptimized
            />
            <span className="font-semibold text-center">{prod.product_name}</span>
            <span className="text-gray-500 text-sm">${Number(prod.price).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FALLBACK_IMAGE = '/images/products/missing-image.png';

const getPublicImageUrl = (input?: string): string | undefined => {
  if (!input) return undefined;
  if (/^https?:\/\//.test(input)) return input;
  if (input.startsWith('/images/')) return input;
  if (input.startsWith('images/')) return `/${input}`;
  return `/images/products/${input}`;
};

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 500;
const THUMB_SIZE = 80;

// Now include a prop for category products:
interface ProductDetailsClientProps {
  product: Product;
  categoryProducts?: Product[]; // Add this prop for the carousel
}

export default function ProductDetailsClient({ product, categoryProducts = [] }: ProductDetailsClientProps) {
  const { addToCart } = useStore();
  const productId = String(product._id);

  useEffect(() => {
    console.log(`[ProductDetailsClient] Rendering product`, {
      _id: product._id,
      id: product.id,
      product_name: product.product_name,
      price: product.price,
    });
  }, [product._id, product.product_name, product.price]);

  const price = Number(product.price);
  const formattedPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

  // Build images array
  let imagesToShow: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagesToShow = product.images
      .map(getPublicImageUrl)
      .filter((src): src is string => Boolean(src));
  } else if ((product as any).image) {
    const single = getPublicImageUrl((product as any).image);
    if (single) imagesToShow = [single];
  }
  if (imagesToShow.length === 0) {
    imagesToShow = [FALLBACK_IMAGE];
  }

  // State for selected main image
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleAddToCart = () => {
    try {
      addToCart(productId, 1);
      console.log(`[ProductDetailsClient] Added to cart: productId=${productId}`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Assume: ingredients, benefits, scent_profile, average_rating on product
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients;
  const benefits = Array.isArray(product.benefits) ? product.benefits.join(', ') : product.benefits;
  const scentProfile = product.scent_profile;
  const averageRating = typeof product.average_rating === 'number' ? product.average_rating : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Thumbnails */}
        {imagesToShow.length > 1 && (
          <div className="flex lg:flex-col flex-row gap-2 items-start">
            {imagesToShow.map((src, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show image ${idx + 1}`}
                aria-pressed={selectedIdx === idx}
                onClick={() => setSelectedIdx(idx)}
                className={`rounded overflow-hidden focus:outline-none transition-all ${selectedIdx === idx ? 'ring-2 ring-blue-500' : 'ring-0'}`}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              >
                <FallbackImage
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="flex justify-center items-start">
          <div
            className="relative rounded overflow-hidden bg-gray-100"
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              minWidth: IMAGE_WIDTH,
              maxWidth: IMAGE_WIDTH,
            }}
            tabIndex={0}
          >
            <Zoom>
              <FallbackImage
                src={imagesToShow[selectedIdx]}
                alt={`${product.product_name} main image`}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                className="object-contain w-full h-full rounded"
                priority
                unoptimized
              />
            </Zoom>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col min-w-0 max-w-xl">
          {/* Name + Price + Rating */}
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold flex-1">{product.product_name}</h1>
            <span className="text-xl font-semibold ml-4">${formattedPrice}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-gray-500">
              {averageRating ? averageRating.toFixed(2) : 'No ratings yet'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-2">Product ID: {productId}</div>
          {product.description && (
            <p className="mb-2 text-gray-700">{product.description}</p>
          )}
          {ingredients && (
            <div className="mb-2">
              <span className="font-semibold">Ingredients:</span>{' '}
              <span className="text-gray-700">{ingredients}</span>
            </div>
          )}
          {benefits && (
            <div className="mb-2">
              <span className="font-semibold">Benefits:</span>{' '}
              <span className="text-gray-700">{benefits}</span>
            </div>
          )}
          {scentProfile && (
            <div className="mb-2">
              <span className="font-semibold">Scent Profile:</span>{' '}
              <span className="text-gray-700">{scentProfile}</span>
            </div>
          )}

          <div className="flex-1" />
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-8 bg-blue-500 text-white px-8 py-3 rounded font-bold text-lg hover:bg-blue-600 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* Carousel below */}
      {categoryProducts.length > 0 && <CategoryCarousel products={categoryProducts} />}
    </div>
  );
}
