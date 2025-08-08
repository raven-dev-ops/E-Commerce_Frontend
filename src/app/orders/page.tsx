'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface OrderItem { id: number | string; product_name: string; quantity: number; price: number; }
interface Order { id: number | string; status: string; total: number; created_at?: string; items: OrderItem[]; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ results?: Order[] } | Order[]>('/orders/');
        const arr = Array.isArray(data) ? data : data.results || [];
        setOrders(arr);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && orders.length === 0 && <div>No orders yet.</div>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={String(o.id)} className="border rounded p-3">
            <div className="flex justify-between">
              <div>Order #{String(o.id)} — <span className="font-semibold capitalize">{o.status}</span></div>
              <a className="text-blue-600 underline" href={`/orders/${o.id}`}>View</a>
            </div>
            <div className="text-sm text-gray-600">Items: {o.items?.length ?? 0} — Total: ${Number(o.total).toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}