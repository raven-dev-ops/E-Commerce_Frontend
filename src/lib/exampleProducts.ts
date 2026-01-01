// src/lib/exampleProducts.ts
import type { Product } from '@/types/product';
import raw from '../../public/example/products.json';

const rawProducts: unknown = raw;
const baseProducts: Product[] = Array.isArray(rawProducts)
  ? rawProducts.reduce<Product[]>((acc, item) => {
      if (!item || typeof item !== 'object') return acc;
      const product = item as Product;
      acc.push({
        ...product,
        price: Number(product.price ?? 0),
        images: Array.isArray(product.images) ? product.images : undefined,
        category: typeof product.category === 'string' ? product.category : '',
      });
      return acc;
    }, [])
  : [];

export function getExampleProducts(): Product[] {
  return baseProducts;
}

export function getExampleProductById(id: string): Product | undefined {
  return baseProducts.find((p) => String(p._id) === String(id));
}

