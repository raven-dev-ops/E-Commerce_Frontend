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
  } catch (error) {
    throw new Error(`Failed to fetch product details: ${error}`);
  }
}

type Props = {
  params: {
    productId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { productId } = params;

  let product: Product | null = null;
  let fetchError: string | null = null;

  try {
    product = await getProduct(productId);
  } catch (err) {
    console.error('Error in ProductDetailPage:', err);
    fetchError = 'Failed to fetch product details.';
  }

  if (fetchError) {
    return <div>Error: {fetchError}</div>;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
