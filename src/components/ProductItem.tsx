"use client";

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { addItemToCart } from '@/lib/cartApi';
import type { Product } from '@/types/product';

interface ProductItemProps {
  product: Product;
}

const FALLBACK_IMAGE = '/images/products/beard-balm.jpg';

const getPublicImageUrl = (input?: string) => {
  if (!input) return undefined;
  const fileName = input.split('/').pop();
  if (!fileName) return undefined;
  return `/images/products/${fileName}`;
};

const getDisplayImage = (product: Product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const normalized = getPublicImageUrl(product.images[0]);
    if (normalized) return normalized;
  }
  if (product.image) {
    const normalized = getPublicImageUrl(product.image);
    if (normalized) return normalized;
  }
  return FALLBACK_IMAGE;
};

export default function ProductItem({ product }: ProductItemProps) {
  const { addToCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageToShow = getDisplayImage(product);

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      await addItemToCart({ product_id: product._id, quantity: 1 });
      addToCart(product._id, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded flex flex-col">
      <Link href={`/products/${product._id}`}>
        <div>
          <div className="relative w-full h-48 mb-4">
            <Image
              src={imageToShow}
              alt={product.product_name}
              fill
              className="rounded object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
              unoptimized // Remove this line for Next.js image optimization
            />
          </div>
          <h2 className="text-xl font-semibold">{product.product_name}</h2>
          <p className="text-gray-700 line-clamp-2">{product.description}</p>
          <p className="text-lg font-bold mt-2">${Number(product.price).toFixed(2)}</p>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 self-start"
        disabled={loading}
      >
        {loading ? 'Adding…' : 'Add to Cart'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
