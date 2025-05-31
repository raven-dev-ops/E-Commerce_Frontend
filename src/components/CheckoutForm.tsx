// components/CheckoutForm.tsx

'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const clearCart = useStore(state => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const card = elements.getElement(CardElement);
    if (!card) {
      setLoading(false);
      return;
    }

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
      await api.post('/orders/', {
        payment_method_id: paymentMethod.id,
      }
      );

      clearCart();
      window.location.href = '/';
    } catch {
      setErrorMsg('Payment failed, please try again.');
      setLoading(false);
    }
  };

  return (
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
  );
}