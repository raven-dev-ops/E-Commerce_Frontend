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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${productId}/`,
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

type PageProps = {
  params: { productId: string }; // Changed back to string
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  // The type is now string, no need for Array.isArray check based on type
  const productId: string = params.productId;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
