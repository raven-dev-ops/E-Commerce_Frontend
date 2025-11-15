// src/app/products/page.tsx
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';
import { getExampleProducts } from '@/lib/exampleProducts';

type ProductsResult = {
  products: Product[];
  error?: string;
  url?: string;
  status?: number;
  usingFallback?: boolean;
};

async function fetchProducts(search: string, category: string): Promise<ProductsResult> {
  const base = (await import('@/lib/baseUrl')).getBaseUrl();

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const url = `${base}/products/${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error('[products] backend responded with error', {
        url,
        status: res.status,
        statusText: res.statusText,
      });
      return {
        products: getExampleProducts(),
        error: `Backend responded with ${res.status} ${res.statusText} for ${url}. Falling back to static example products.`,
        url,
        status: res.status,
        usingFallback: true,
      };
    }
    const data = await res.json();
    const items: any[] = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
    const products = items.map((p) => ({
      ...p,
      price: Number(p.price),
      images: Array.isArray(p.images) ? p.images : [],
      category: typeof p.category === 'string' ? p.category : '',
    }));
    return { products, url, usingFallback: false };
  } catch (error: any) {
    console.error('[products] failed to fetch from backend', { url, error });
    return {
      products: getExampleProducts(),
      error: `Failed to reach backend at ${url}. Using static example products instead.`,
      url,
      usingFallback: true,
    };
  }
}

export default async function ProductsPage(props: any) {
  const search = props?.searchParams?.q || '';
  const category = props?.searchParams?.category || '';
  const { products, error, url, status, usingFallback } = await fetchProducts(search, category);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">
            Backend issue detected{usingFallback ? ' – showing static example products' : ''}
          </p>
          <p>{error}</p>
          <p className="mt-1 text-xs text-red-700">
            Hint: verify that <span className="font-mono break-all">{url}</span>{' '}
            exists on the Art&nbsp;Bay API and matches the expected path. Current status:
            <span className="font-mono"> {status ?? 'network error'}</span>.
          </p>
        </div>
      )}
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

      {products.length === 0 && !error && (
        <p>No products found.</p>
      )}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductItem key={String(p._id)} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
