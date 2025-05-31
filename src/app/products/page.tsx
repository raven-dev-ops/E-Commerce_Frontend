import ProductItem from '@/components/ProductItem';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

async function getProducts(): Promise<Product[]> {
  console.log('Fetching products from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`, { cache: 'no-store' });
  if (!res.ok) {
    // This will activate the closest error.js Error Boundary
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (err: unknown) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = 'An unknown error occurred';
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      {!error && (
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
