import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

interface CartItem {
  productId: number;
  quantity: number;
}

export default function Cart() {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const responses = await Promise.all(
        cart.map(item =>
          api.get(`/products/${item.productId}/`).then(res => res.data)
        )
      );
      setProducts(responses);
    }
    if (cart.length) fetchProducts();
  }, [cart]);

  const total = cart.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    return sum + (prod?.price || 0) * item.quantity;
  }, 0);

  if (!cart.length) return <div className="p-4">Your cart is empty.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <ul>
        {cart.map(item => {
          const prod = products.find(p => p.id === item.productId);
          return (
            <li key={item.productId} className="flex justify-between mb-2">
              <span>
                {prod?.name} x {item.quantity}
              </span>
              <span>${(prod?.price * item.quantity).toFixed(2)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 font-semibold">Total: ${total.toFixed(2)}</div>
      <div className="mt-6 flex space-x-4">
        <Link href="/checkout">
          <a className="px-4 py-2 bg-green-600 text-white rounded">
            Checkout
          </a>
        </Link>
        <button
          onClick={() => clearCart()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
