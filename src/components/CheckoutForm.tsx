'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore, StoreState } from '@/store/useStore';
import { api } from '@/lib/api';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const clearCart = useStore((state: StoreState) => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMsg('Stripe has not loaded yet.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMsg('Card details not found.');
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error || !paymentMethod) {
      setErrorMsg(error?.message || 'Payment error');
      setLoading(false);
      return;
    }

    try {
      await api.post('/orders/', {
        payment_method_id: paymentMethod.id,
      });

      clearCart();
      setSuccessMsg('Payment successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || 'Payment failed, please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 border rounded p-2">
        <CardElement />
      </div>
      {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}
      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}
