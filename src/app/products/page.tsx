// src/app/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

async function getProducts(): Promise<Product[]> {
  // Ensure only one slash between base URL and path
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/') 
    ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1) 
    : process.env.NEXT_PUBLIC_API_BASE_URL;
  // Corrected URL to match backend: /products/
  const url = `${baseUrl}/products/`;

  console.log('Fetching products from:', url);

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  
  const data = await res.json();
  // Extract the results array from the paginated response
  return data.results;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try   { setProducts(await getProducts()); }
      catch { setError('Failed to fetch products'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error   && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductItem key={p.id} product={p} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
