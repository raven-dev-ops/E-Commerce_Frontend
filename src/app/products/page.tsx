// src/app/products/page.tsx
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

async function fetchProducts(search: string, category: string): Promise<Product[]> {
  let base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (base.startsWith('http://')) base = base.replace(/^http:\/\//, 'https://');
  if (!base.endsWith('/api/v1')) base = base.endsWith('/api') ? `${base}/v1` : `${base}/api/v1`;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const url = `${base}/products/${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    // Return empty list on failure to allow page render
    return [];
  }
  const data = await res.json();
  const items: any[] = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
  return items.map((p) => ({
    ...p,
    price: Number(p.price),
    images: Array.isArray(p.images) ? p.images : [],
    category: typeof p.category === 'string' ? p.category : '',
  }));
}

export default async function ProductsPage(props: any) {
  const search = props?.searchParams?.q || '';
  const category = props?.searchParams?.category || '';
  const products = await fetchProducts(search, category);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <form className="mb-6 flex gap-2" action="/products" method="get">
        <input
          type="text"
          name="q"
          placeholder="Search products..."
          defaultValue={search}
          className="border rounded p-2 flex-1"
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          defaultValue={category}
          className="border rounded p-2 w-48"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Filter</button>
      </form>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductItem key={String(p._id)} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
