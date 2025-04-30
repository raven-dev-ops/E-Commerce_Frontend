import useSWR from 'swr';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Home() {
  const { data: products, error } = useSWR(
    '/products/',
    url => api.get(url).then(res => res.data)
  );

  if (error) return <div>Error loading products.</div>;
  if (!products) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product: any) => (
          <div key={product.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="mt-2">${product.price}</p>
            <Link href={`/products/${product.id}`}>
              <a className="text-blue-500 mt-4 inline-block">View Details</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
