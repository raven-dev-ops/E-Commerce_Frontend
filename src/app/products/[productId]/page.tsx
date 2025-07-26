'use client';

import React, { useState, useEffect } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import FallbackImage from '@/components/FallbackImage';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/product';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts?: Product[];
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

export default function ProductDetailsClient({
  product,
  relatedProducts = [],
}: ProductDetailsClientProps) {
  const { addToCart } = useStore();
  const productId = String(product._id);

  useEffect(() => {
    console.log(`[ProductDetailsClient] Rendering product`, {
      _id: product._id,
      product_name: product.product_name,
      price: product.price,
      category: product.category,
    });
    console.log('[ProductDetailsClient] relatedProducts:', relatedProducts);
  }, [product, relatedProducts]);

  const price = Number(product.price);
  const formattedPrice = !isNaN(price) ? price.toFixed(2) : '0.00';

  // Build array of images for main and thumbs
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

  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleAddToCart = () => {
    try {
      addToCart(productId, 1);
      console.log(`[ProductDetailsClient] Added to cart: productId=${productId}`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Star rating
  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          aria-hidden="true"
          className={`w-5 h-5 inline-block ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <title>{i <= rating ? 'Full Star' : 'Empty Star'}</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.186a1 1 0 00.95.69h4.401c.969 0 1.371 1.24.588 1.81l-3.565 2.59a1 1 0 00-.364 1.118l1.357 4.186c.3.921-.755 1.688-1.54 1.118l-3.565-2.59a1 1 0 00-1.175 0l-3.565 2.59c-.784.57-1.838-.197-1.54-1.118l1.357-4.186a1 1 0 00-.364-1.118l-3.565-2.59c-.784-.57-.38-1.81.588-1.81h4.401a1 1 0 00.95-.69l1.357-4.186z" />
        </svg>
      );
    }
    return stars;
  };

  // Carousel config (like products/page.tsx)
  const getCarouselSettings = (count: number) => ({
    dots: false,
    arrows: true,
    infinite: count > 1,
    speed: 500,
    slidesToShow: Math.min(4, count),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), arrows: true } },
      { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), arrows: true } },
      { breakpoint: 480,  settings: { slidesToShow: 1, arrows: true } },
    ],
  });

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
          {/* Title and price row */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.product_name}</h1>
            <span className="text-xl font-semibold text-blue-700">${formattedPrice}</span>
          </div>
          <div className="text-xs text-gray-400 mb-2">Product ID: {productId}</div>

          {/* Star Rating */}
          <div className="mb-2 flex items-center gap-2">
            {renderStars(product.average_rating)}
            {typeof product.average_rating === 'number' && (
              <span className="text-gray-500 text-sm ml-1">
                {Number(product.average_rating).toFixed(2)} / 5
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="mb-2 text-gray-700">{product.description}</p>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="mb-2">
              <span className="font-semibold">Ingredients: </span>
              <span className="text-gray-700">
                {Array.isArray(product.ingredients)
                  ? product.ingredients.join(', ')
                  : product.ingredients}
              </span>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div className="mb-2">
              <span className="font-semibold">Benefits: </span>
              <span className="text-gray-700">
                {Array.isArray(product.benefits)
                  ? product.benefits.join(', ')
                  : product.benefits}
              </span>
            </div>
          )}

          {/* Scent Profile */}
          {product.scent_profile && (
            <div className="mb-2">
              <span className="font-semibold">Scent Profile: </span>
              <span className="text-gray-700">{product.scent_profile}</span>
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

      {/* Related Products Carousel */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">More from this category</h2>
          <Slider {...getCarouselSettings(relatedProducts.length)}>
            {relatedProducts.map((item) => {
              const src =
                Array.isArray(item.images) && item.images.length > 0
                  ? getPublicImageUrl(item.images[0])
                  : getPublicImageUrl(item.image);
              const relId = String(item._id);
              return (
                <div key={relId} className="px-2">
                  <div className="rounded overflow-hidden shadow transform transition-transform duration-200 hover:scale-105 bg-white">
                    <Link href={`/products/${relId}`}>
                      <a className="block">
                        <div className="relative w-full h-48 flex items-center justify-center">
                          <FallbackImage
                            src={src || FALLBACK_IMAGE}
                            alt={item.product_name}
                            width={120}
                            height={150}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-medium">{item.product_name}</span>
                            <span className="text-base font-semibold">${Number(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      )}
    </div>
  );
}
