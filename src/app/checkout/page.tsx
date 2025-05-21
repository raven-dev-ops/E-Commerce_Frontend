'use client';

import { useState, useEffect, useMemo } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface ProductDetails {
  id: string | number;
  product_name: string;
  price: number;
}

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();

  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorFetchingDetails, setErrorFetchingDetails] = useState<string | null>(null);

  const [productDetails, setProductDetails] = useState<{
    [productId: string | number]: ProductDetails | null;
  }>({});

  useEffect(() => {
    const fetchProductDetails = async (productId: string | number) => {
      try {
        const response = await axios.get(`/api/products/${productId}/`);
        return response.data as ProductDetails;
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        return null;
      }
    };

    const fetchAllDetails = async () => {
      setLoadingDetails(true);
      setErrorFetchingDetails(null);

      const ids = Array.from(new Set(cart.map(item => item.productId)));
      const results: typeof productDetails = {};

      await Promise.all(
        ids.map(async id => {
          results[id] = await fetchProductDetails(id);
        })
      );

      setProductDetails(results);
      setLoadingDetails(false);
    };

    if (cart.length > 0) fetchAllDetails(); else setLoadingDetails(false);
  }, [cart]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = productDetails[item.productId];
      return product ? sum + product.price * item.quantity : sum;
    }, 0);
  }, [cart, productDetails]);

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
    } catch {
      setErrorMsg('Payment failed, please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        {loadingDetails && <p>Loading summary details...</p>}
        {errorFetchingDetails && <p className="text-red-500">{errorFetchingDetails}</p>}
        {!loadingDetails && cart.length > 0 && (
          <>
            <ul>
              {cart.map(item => {
                const product = productDetails[item.productId];
                if (!product) return null;
                const subtotal = product.price * item.quantity;
                return (
                  <li
                    key={item.productId}
                    className="flex justify-between py-1 border-b border-gray-200"
                  >
                    <span>{product.product_name} x {item.quantity}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="font-bold mt-2 flex justify-between">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

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
