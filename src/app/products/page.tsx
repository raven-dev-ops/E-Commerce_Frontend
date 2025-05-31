import { useEffect, useState } from 'react';
import ProductItem from '@/components/ProductItem'; // Adjust path based on actual location
import type { Product } from '../types'; // Ensure you have a Product interface defined

async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
