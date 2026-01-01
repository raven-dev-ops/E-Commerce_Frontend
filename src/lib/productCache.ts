import { api } from '@/lib/api';
import { parseWithSchema, productSchema } from '@/lib/schemas';

export type ProductSummary = {
  id: string;
  product_name: string;
  price: number;
  image?: string;
};

const cache = new Map<string, Promise<ProductSummary>>();

export const fetchProductSummary = async (
  productId: string | number
): Promise<ProductSummary> => {
  const key = String(productId);
  const cached = cache.get(key);
  if (cached) return cached;

  const request = api.get(`/products/${key}/`).then(({ data }) => {
    const parsed = parseWithSchema(productSchema, data, 'product');
    return {
      id: parsed._id,
      product_name: parsed.product_name,
      price: parsed.price,
      image: parsed.image || parsed.images?.[0],
    };
  });

  cache.set(key, request);
  return request;
};
