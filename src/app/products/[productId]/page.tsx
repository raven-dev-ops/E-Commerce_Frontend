// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import type { Product } from '@/types/product';
import { fetchProduct, fetchProductsByCategory } from '@/lib/apiClient';

// Next.js page component
type ProductDetailPageProps = {
  params: {
    productId: string;
  };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = params;

  const product = await fetchProduct(productId);
  if (!product) notFound();

  let relatedProducts: Product[] = [];
  if (product.category) {
    relatedProducts = await fetchProductsByCategory(product.category, productId);
  }

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
