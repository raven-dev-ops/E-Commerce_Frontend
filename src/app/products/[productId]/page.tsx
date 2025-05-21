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

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${productId}/`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch product details');
    }
    return res.json();
  } catch (_error) {
    throw new Error(`Failed to fetch product details: ${_error}`);
  }
}

type Props = {
  params: {
    productId: string;
  };
};

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = params;

  let product: Product | null = null;
  let error: string | null = null;

  try {
    product = await getProduct(productId);
  } catch (_error) {
    console.error('Error in ProductDetailPage:', _error);
    error = 'Failed to fetch product details.';
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
