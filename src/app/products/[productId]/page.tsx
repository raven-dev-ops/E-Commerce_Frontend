import React from 'react';
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

interface ProductDetailPageProps {
  params: { productId: string };
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${productId}/`, {
      cache: 'no-store', // Fetch data on every request
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Product not found
      throw new Error('Failed to fetch product details');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product details');
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = params;

  let product: Product | null = null;
  let error: string | null = null;

  try {
    product = await getProduct(productId);
  } catch (err) {
    error = 'Failed to fetch product details.';
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    // Use Next.js notFound to render the not-found page
    notFound();
  }

  // Pass the fetched product data to the Client Component
  return <ProductDetailsClient product={product} />;
}
