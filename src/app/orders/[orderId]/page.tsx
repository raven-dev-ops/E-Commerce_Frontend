'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchOrder, type Order } from '@/lib/apiClient';
import { orderSchema, parseWithSchema } from '@/lib/schemas';
import { buildOrdersWsUrl } from '@/lib/ws';

type OrderDetailPageProps = {
  params: {
    orderId: string;
  };
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);

  const refreshOrder = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      try {
        const data = await fetchOrder(orderId);
        setOrder(data);
        if (!options?.silent) setError(null);
      } catch (e) {
        if (!options?.silent) {
          setError((e as Error).message);
        }
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    void refreshOrder();
  }, [refreshOrder]);

  useEffect(() => {
    let cancelled = false;

    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startPolling = () => {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(() => {
        void refreshOrder({ silent: true });
      }, 10000);
    };

    const stopHeartbeat = () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    const startHeartbeat = () => {
      if (heartbeatTimerRef.current) return;
      heartbeatTimerRef.current = setInterval(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch {
          // Ignore heartbeat errors, connection close will trigger fallback.
        }
      }, 25000);
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      if (reconnectTimerRef.current) return;
      reconnectAttemptRef.current += 1;
      const attempt = reconnectAttemptRef.current;
      const baseDelay = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      const jitter = Math.floor(Math.random() * 500);
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, baseDelay + jitter);
    };

    const connect = () => {
      if (cancelled) return;
      const wsUrl = buildOrdersWsUrl(orderId);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        reconnectAttemptRef.current = 0;
        stopPolling();
        startHeartbeat();
        void refreshOrder({ silent: true });
      };

      ws.onmessage = (evt) => {
        try {
          const data: unknown = JSON.parse(evt.data);
          if (data && typeof data === 'object') {
            const payload = data as { order?: unknown; status?: unknown };
            if (payload.order) {
              try {
                const parsed = parseWithSchema(orderSchema, payload.order, 'order');
                setOrder(parsed);
                return;
              } catch {
                // Ignore invalid order payloads.
              }
            }
            const status = payload.status;
            if (typeof status === 'string') {
              setOrder((prev) => (prev ? { ...prev, status } : prev));
            }
          }
        } catch {
          // Ignore malformed messages.
        }
      };

      ws.onerror = () => {
        if (cancelled) return;
        ws.close();
      };

      ws.onclose = () => {
        if (cancelled) return;
        stopHeartbeat();
        startPolling();
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      cancelled = true;
      stopHeartbeat();
      stopPolling();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
    };
  }, [orderId, refreshOrder]);

  const total = useMemo(() => Number(order?.total || 0).toFixed(2), [order]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!order) return <div className="p-4">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Order #{String(order.id)}</h1>
      <div className="mb-4">Status: <span className="font-semibold capitalize">{order.status}</span></div>
      <ul className="space-y-2 mb-4">
        {order.items.map((it) => (
          <li key={String(it.id)} className="flex justify-between border rounded p-2">
            <span>{it.product_name} x {it.quantity}</span>
            <span>${Number(it.price * it.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="font-bold">Total: ${total}</div>
    </div>
  );
}
