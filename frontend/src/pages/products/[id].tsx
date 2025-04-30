import { useRouter } from 'next/router';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: product, error } = useSWR(
    id ? `/products/${id}/` : null,
    url => api.get(url).then(res => res.data)
  );
  const addToCart = useStore(state => state.addToCart);

  if (error) return <div>Error loading product.</div>;
  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="text-xl font-semibold mb-4">${product.price}</p>
      <button
        onClick={() => addToCart(product.id, 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}
