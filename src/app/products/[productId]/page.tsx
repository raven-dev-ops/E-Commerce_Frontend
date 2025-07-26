// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product';

async function getProduct(productId: string): Promise<Product | null> {
  // 1. Pull in your base URL, strip any trailing slash
  let rawBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
  // 2. Force HTTPS if someone left http:// in your env
  if (rawBase.startsWith('http://')) {
    rawBase = rawBase.replace(/^http:\/\//, 'https://');
  }
  const base = rawBase;

  // 3. Build the product detail URL
  const url = `${base}/products/${productId}/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product: HTTP ${res.status}`);

  const data = await res.json();
  
  // 4. Normalize the ID field (could be id, _id, or Mongo oid)
  let id = '';
  if (typeof data.id === 'string' && data.id) {
    id = data.id;
  } else if (typeof data._id === 'string' && data._id) {
    id = data._id;
  } else if (
    typeof data._id === 'object' &&
    data._id &&
    '$oid' in data._id
  ) {
    id = (data._id as { $oid: string }).$oid;
  }

  // 5. Build your Product shape (coerce price to number)
  const product: Product = {
    ...data,
    _id: id,
    price: Number(data.price),
  };

  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  if (!product) notFound();
  return <ProductDetailsClient product={product} />;
}
