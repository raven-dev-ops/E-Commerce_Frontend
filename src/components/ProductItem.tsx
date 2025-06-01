// src/components/ProductItem.tsx

// src/components/ProductItem.tsx

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

export default function ProductItem({ product }: ProductItemProps) {
  const { addToCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always use getPublicImageUrl logic
  let imageToShow = FALLBACK_IMAGE;
  if (product.images && product.images.length > 0) {
    const first = getPublicImageUrl(product.images[0]);
    if (first) imageToShow = first;
  } else if (product.image) {
    const resolved = getPublicImageUrl(product.image);
    if (resolved) imageToShow = resolved;
  }

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      await addItemToCart({ product_id: Number(product._id), quantity: 1 });
      addToCart(Number(product._id), 1);
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

