// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product';

interface Params {
  params: {
    productId: string;
  };
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    // Build base URL and strip trailing slash
    const rawBase =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
    // Force HTTPS
    const base = rawBase.startsWith('http://')
      ? rawBase.replace(/^http:\/\//, 'https://')
      : rawBase;

    const res = await fetch(`${base}/products/${productId}/`, {
      cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Normalize the ID (support _id, id, and { $oid })
    let id = '';
    if (typeof data.id === 'string' && data.id) {
      id = data.id;
    } else if (typeof data._id === 'string' && data._id) {
      id = data._id;
    } else if (
      typeof data._id === 'object' &&
      data._id !== null &&
      '$oid' in data._id
    ) {
      id = (data._id as { $oid: string }).$oid;
    }

    return {
      ...data,
      _id: id,
      price: Number(data.price),
    };
  } catch (err) {
    console.error('Failed to fetch product details:', err);
    throw err;
  }
}

export default async function ProductDetailPage({ params }: Params) {
  const product = await getProduct(params.productId);
  if (!product) {
    notFound();
  }
  return <ProductDetailsClient product={product} />;
}
