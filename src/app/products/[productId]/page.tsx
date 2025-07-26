// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product';

// Fetch a single product by its ID
async function getProduct(productId: string): Promise<Product | null> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  const res = await fetch(`${raw}/products/${productId}/`, { cache: 'no-store' });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product: HTTP ${res.status}`);

  const data = await res.json();
  return {
    ...data,
    price: Number(data.price),
  } as Product;
}

// Fetch related products by category, excluding the current product
async function getRelatedProducts(category: string, excludeProductId: string): Promise<Product[]> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  // Adjust query params as needed for your backend
  const res = await fetch(`${raw}/products/?category=${encodeURIComponent(category)}`, { cache: 'no-store' });

  if (!res.ok) return [];
  const data = await res.json();

  return Array.isArray(data)
    ? data
        .filter((p: any) => String(p._id) !== String(excludeProductId))
        .map((p: any) => ({
          ...p,
          price: Number(p.price),
        }))
    : [];
}

export default async function ProductDetailPage(props: any) {
  const {
    params: { productId },
  } = props;

  const product = await getProduct(productId);
  if (!product) notFound();

  // Fetch related products using the product's category
  let relatedProducts: Product[] = [];
  if (product.category) {
    relatedProducts = await getRelatedProducts(product.category, productId);
  }

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
