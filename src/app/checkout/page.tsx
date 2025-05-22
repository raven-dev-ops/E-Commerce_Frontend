'use client';

import { useState, useEffect, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useStore } from '@/store/useStore'; // Keep useStore for cart and product details logic
import { api } from '@/lib/api';
import axios from 'axios';

interface ProductDetails {
  id: string | number;
  product_name: string;
  price: number;
}

import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm'; // Import the new component

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

export default function Checkout() {

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

 const stripePromise = loadStripe(stripePublicKey!);
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

      <Elements stripe={stripePromise}>
 <CheckoutForm /> {/* Render the new component here */}
      </Elements>
    </div>
  );
}
