// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product'; // Use your shared Product type

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseUrl}/products/${productId}/`;

    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Ensure _id is string, price is number
    const product: Product = {
      ...data,
      _id: String(data._id),
      price: Number(data.price),
    };

    return product;
  } catch (err) {
    console.error('Failed to fetch product details:', err);
    throw err;
  }
}

export default async function ProductDetailPage({ params }: any) {
  const product = await getProduct(params.productId);
  if (!product) notFound();
  return <ProductDetailsClient product={product} />;
}

