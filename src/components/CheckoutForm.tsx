'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore, StoreState } from '@/store/useStore';
import { createOrder } from '@/lib/apiClient';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const clearCart = useStore((state: StoreState) => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const errorId = 'checkout-form-error';
  const successId = 'checkout-form-success';
  const describedBy = [errorMsg ? errorId : null, successMsg ? successId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const getIdempotencyKey = () => {
    if (idempotencyKeyRef.current) return idempotencyKeyRef.current;
    const key =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `order_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    idempotencyKeyRef.current = key;
    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
      const data = await createOrder(
        { payment_method_id: paymentMethod.id },
        getIdempotencyKey()
      );

      const orderId = data?.id ?? data?.order_id ?? data?.order?.id ?? '';
      const clientSecret = data?.payment_intent_client_secret || data?.client_secret;
      if (data?.requires_action) {
        if (!clientSecret) {
          setErrorMsg('Payment requires additional action, but no client secret was provided.');
          setLoading(false);
          return;
        }
        const result = await stripe.confirmCardPayment(clientSecret);
        if (result.error) {
          setErrorMsg(result.error.message || 'Payment authentication failed.');
          setLoading(false);
          return;
        }
        if (result.paymentIntent?.status && result.paymentIntent.status !== 'succeeded') {
          setErrorMsg('Payment was not completed. Please try again.');
          setLoading(false);
          return;
        }
      }

      clearCart();
      setSuccessMsg('Payment successful! Redirecting...');
      setTimeout(() => {
        const target = orderId ? `/checkout/success?orderId=${orderId}` : '/checkout/success';
        router.push(target);
      }, 1200);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-describedby={describedBy}>
      <div className="mb-4 border rounded p-2">
        <CardElement />
      </div>
      {errorMsg && (
        <div id={errorId} role="alert" aria-live="assertive" className="text-red-600 mb-4">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div id={successId} role="status" aria-live="polite" className="text-green-600 mb-4">
          {successMsg}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
