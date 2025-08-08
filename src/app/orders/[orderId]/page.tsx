'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface OrderItem { id: number | string; product_name: string; quantity: number; price: number; }
interface Order { id: number | string; status: string; total: number; created_at?: string; items: OrderItem[]; }

function getWsBase(): string {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  // Switch to wss and strip trailing /api...
  raw = raw.replace(/^https:\/\//, 'wss://');
  raw = raw.replace(/\/api(\/v1)?$/, '');
  return raw;
}

export default function OrderDetailPage(props: any) {
  const { params: { orderId } } = props;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Order>(`/orders/${orderId}/`);
        setOrder(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  useEffect(() => {
    const base = getWsBase();
    const wsUrl = `${base}/ws/orders/${orderId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.status && order) {
          setOrder({ ...order, status: data.status });
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => ws.close();
  }, [orderId, order]);

  const total = useMemo(() => Number(order?.total || 0).toFixed(2), [order]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!order) return <div className="p-4">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Order #{String(order.id)}</h1>
      <div className="mb-4">Status: <span className="font-semibold capitalize">{order.status}</span></div>
      <ul className="space-y-2 mb-4">
        {order.items.map((it) => (
          <li key={String(it.id)} className="flex justify-between border rounded p-2">
            <span>{it.product_name} × {it.quantity}</span>
            <span>${Number(it.price * it.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="font-bold">Total: ${total}</div>
    </div>
  );
}