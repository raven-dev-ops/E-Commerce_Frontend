// src/components/ProductItem.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/product';

interface ProductItemProps {
  product: Product;
}

const FALLBACK_IMAGE = '/images/products/missing-image.png';

function getPublicImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('images/')) return '/' + path;
  if (path.includes('images/products/')) {
    return path.startsWith('/') ? path : '/' + path;
  }
  return `/images/products/${path}`;
}

function getDisplayImage(product: Product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return getPublicImageUrl(product.images[0]);
  }
  if (product.image) {
    return getPublicImageUrl(product.image);
  }
  return undefined;
}

export default function ProductItem({ product }: ProductItemProps) {
  const id = String(product._id);
  const initialImage = getDisplayImage(product) || FALLBACK_IMAGE;
  const [src, setSrc] = useState(initialImage);

  return (
    <div className="p-4 rounded flex flex-col focus:outline-none">
      <Link href={`/products/${id}`} className="block rounded overflow-hidden focus:outline-none">
        <div className="relative w-full h-48 mb-4">
          <Image
            src={src}
            alt={product.product_name}
            fill
            className="rounded object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setSrc(FALLBACK_IMAGE)}
          />
        </div>
        <h2 className="text-xl font-semibold">{product.product_name}</h2>
        {product.description && (
          <p className="text-gray-700 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-lg font-bold mt-2">
          ${Number(product.price).toFixed(2)}
        </p>
      </Link>
    </div>
  );
}
