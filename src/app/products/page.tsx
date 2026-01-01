// src/app/products/page.tsx
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';
import { getExampleProducts } from '@/lib/exampleProducts';

function filterProducts(all: Product[], search: string, category: string): Product[] {
  const term = search.trim().toLowerCase();
  const cat = category.trim().toLowerCase();

  return all.filter((p) => {
    const name = p.product_name?.toLowerCase() || '';
    const desc = (p.description || '').toLowerCase();
    const catVal = (p.category || '').toLowerCase();

    const matchesSearch = !term || name.includes(term) || desc.includes(term);
    const matchesCategory = !cat || catVal === cat;

    return matchesSearch && matchesCategory;
  });
}

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = (await Promise.resolve(searchParams)) ?? {};
  const search = resolved.q || '';
  const category = resolved.category || '';

  const allProducts = getExampleProducts();
  const products = filterProducts(allProducts, search, category);

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
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Filter
        </button>
      </form>

      {products.length === 0 && <p>No products found.</p>}

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

