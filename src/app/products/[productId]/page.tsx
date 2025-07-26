// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product';

// Fetch a single product by its ID
async function getProduct(productId: string): Promise<Product | null> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  const url = `${raw}/products/${productId}/`;

  console.log(`[getProduct] Fetching product: ${url}`);
  const res = await fetch(url, { cache: 'no-store' });

  if (res.status === 404) {
    console.log(`[getProduct] Product not found: ${productId}`);
    return null;
  }
  if (!res.ok) {
    console.error(`[getProduct] Error fetching product: HTTP ${res.status}`);
    throw new Error(`Failed to fetch product: HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log('[getProduct] Product data:', data);

  return {
    ...data,
    price: Number(data.price),
  } as Product;
}

// Fetch related products by category, excluding the current product
async function getRelatedProducts(category: string, excludeProductId: string): Promise<Product[]> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  const url = `${raw}/products/?category=${encodeURIComponent(category)}`;

  console.log(`[getRelatedProducts] Fetching related products: ${url} (excluding ID: ${excludeProductId})`);
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    console.error(`[getRelatedProducts] Error fetching related products: HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  console.log(`[getRelatedProducts] Fetched ${Array.isArray(data) ? data.length : 0} products for category "${category}"`);

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

  console.log(`[ProductDetailPage] Requested productId: ${productId}`);

  const product = await getProduct(productId);
  if (!product) {
    console.log('[ProductDetailPage] notFound() triggered');
    notFound();
  }

  let relatedProducts: Product[] = [];
  if (product.category) {
    relatedProducts = await getRelatedProducts(product.category, productId);
    console.log(`[ProductDetailPage] Related products count: ${relatedProducts.length}`);
  } else {
    console.log('[ProductDetailPage] No category on product, skipping related products fetch');
  }

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
