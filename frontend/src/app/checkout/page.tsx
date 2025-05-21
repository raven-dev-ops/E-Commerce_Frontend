"use client";

import { useState, useEffect, useMemo } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image'; // Assuming you want to display images

interface CartItem {
  productId: number;
  quantity: number;
}

export default function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State to store fetched product details for summary
  const [productDetails, setProductDetails] = useState<{ [productId: string | number]: any }>({});
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorFetchingDetails, setErrorFetchingDetails] = useState<string | null>(null);

  // Helper function to fetch single product details
  const fetchProductDetails = async (productId: string | number) => {
    try {
      const response = await axios.get(`/api/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for product ${productId}:`, error);
      return null;
    }
  };

  // Fetch product details for items in the cart for summary
  useEffect(() => {
    const fetchDetails = async () => {
      setLoadingDetails(true);
      setErrorFetchingDetails(null);
      const uniqueProductIds = Array.from(new Set(cart.map(item => item.productId)));
      const detailsMap: { [productId: string | number]: any } = {};
      await Promise.all(uniqueProductIds.map(async (productId) => {
        detailsMap[productId] = await fetchProductDetails(productId);
      }));
      setProductDetails(detailsMap); setLoadingDetails(false);
    };
    if (cart.length > 0) { fetchDetails(); } else { setProductDetails({}); setLoadingDetails(false); }
  }, [cart]);


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

  // Calculate total price for the summary
  const total = useMemo(() => {
    let calculatedTotal = 0;
    cart.forEach(item => {
      const product = productDetails[item.productId];
      if (product && product.price) {
        calculatedTotal += product.price * item.quantity;
      }
    });
    return calculatedTotal;
  }, [cart, productDetails]);


  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        {loadingDetails && <p>Loading summary details...</p>}
        {errorFetchingDetails && <p className="text-red-500">{errorFetchingDetails}</p>}
        {!loadingDetails && !errorFetchingDetails && cart.length > 0 && (
          <ul>
            {cart.map(item => {
              const product = productDetails[item.productId];
              if (!product) return null; // Don't display if product details are not available
              const itemSubtotal = (product.price || 0) * item.quantity;
              return (
                <li key={item.productId} className="flex justify-between py-1 border-b border-gray-200">
                  <span>{product.product_name} x {item.quantity}</span>
                  <span>${itemSubtotal.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        )}
        {!loadingDetails && !errorFetchingDetails && cart.length > 0 && <div className="font-bold mt-2 flex justify-between"><span>Total:</span><span>${total.toFixed(2)}</span></div>}
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