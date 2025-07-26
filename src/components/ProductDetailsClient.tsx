'use client';

import React, { useState, useEffect } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import FallbackImage from '@/components/FallbackImage';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/product';

interface ProductDetailsClientProps {
  product: Product;
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

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addToCart } = useStore();

  // Always use _id for MongoEngine (it is a string)
  const productId = String(product._id);

  useEffect(() => {
    // Log for debugging
    console.log(`[ProductDetailsClient] Rendering product`, {
      _id: product._id,
      id: product.id,
      product_name: product.product_name,
      price: product.price,
    });
  }, [product._id, product.product_name, product.price]);

  const price = Number(product.price);
  const formattedPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

  // Build array of images
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
      // Also log to console
      console.log(`[ProductDetailsClient] Added to cart: productId=${productId}`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

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
                className={`rounded overflow-hidden focus:outline-none transition-all ${
                  selectedIdx === idx ? 'ring-2 ring-blue-500' : 'ring-0'
                }`}
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
            tabIndex={0} // Accessibility: focusable
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
          <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
          <p className="text-lg font-semibold mb-2">${formattedPrice}</p>
          <div className="text-xs text-gray-400 mb-2">Product ID: {productId}</div>
          {product.description && (
            <p className="mb-2 text-gray-700">{product.description}</p>
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
    </div>
  );
}
