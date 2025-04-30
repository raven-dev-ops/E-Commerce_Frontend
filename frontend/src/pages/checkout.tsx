import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const card = elements.getElement(CardElement);
    if (!card) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });
    if (error) {
      setErrorMsg(error.message || 'Payment error');
      setLoading(false);
      return;
    }

    try {
      await api.post(
        '/orders/',
        {
          payment_method_id: paymentMethod.id,
          items: cart,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.access}`,
          },
        }
      );
      clearCart();
      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement className="p-2 border rounded" />
        </div>
        {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'Processing…' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}
