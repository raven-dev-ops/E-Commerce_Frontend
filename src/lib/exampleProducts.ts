// src/lib/exampleProducts.ts
import type { Product } from '@/types/product';
import raw from '../../public/example/products.json';

const baseProducts: Product[] = (raw as any[]).map((p: any) => ({
  ...p,
  price: Number(p.price),
  images: Array.isArray(p.images) ? p.images : [],
  category: typeof p.category === 'string' ? p.category : '',
}));

export function getExampleProducts(): Product[] {
  return baseProducts;
}

export function getExampleProductById(id: string): Product | undefined {
  return baseProducts.find((p) => String(p._id) === String(id));
}

