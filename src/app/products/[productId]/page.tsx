// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';

interface Product {
  _id: string | number;
  product_name: string;
  price: number;
  description?: string;
  image?: string;
  images?: string[];
  ingredients?: string[];
  benefits?: string[];
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    // Ensure only one slash between base URL and path
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/') 
      ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1) 
      : process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseUrl}/api/products/${productId}/`;

    const res = await fetch(
      url,
      { cache: 'no-store' }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Product;
  } catch (err) {
    console.error('Failed to fetch product details:', err);
    throw err;
  }
}

export default async function ProductDetailPage({ params }: any) {
  const product = await getProduct(params.productId);
  if (!product) {
    notFound();
  }
  return <ProductDetailsClient product={product} />;
}
