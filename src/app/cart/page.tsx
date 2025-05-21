// ✅ Must be at the top
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';
import Image from 'next/image';

type ProductDetail = {
  _id?: string | number;
  product_name?: string;
  price?: number;
  image?: string;
  error?: boolean;
  message?: string;
};

const fetchProductDetails = async (productId: string | number): Promise<ProductDetail> => {
  try {
    const response = await axios.get(`/api/products/${productId}/`);
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching product ${productId} details:`, message);
    return { error: true, message };
  }
};

export default function CartPage() {
  const { cart, updateCartItemQuantity, removeFromCart } = useStore();
  const [productDetails, setProductDetails] = useState<Record<string | number, ProductDetail | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      const ids = Array.from(new Set(cart.map(item => item.productId)));
      const detailsMap: Record<string | number, ProductDetail | null> = {};

      await Promise.all(ids.map(async (id) => {
        const detail = await fetchProductDetails(id);
        detailsMap[id] = detail;
      }));

      setProductDetails(detailsMap);

      if (Object.values(detailsMap).some(d => d?.error)) {
        setError("Some product details failed to load.");
      }

      setLoading(false);
    };

    if (cart.length) {
      fetchDetails();
    } else {
      setProductDetails({});
      setLoading(false);
    }
  }, [cart]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const detail = productDetails[item.productId];
      return detail && !detail.error && detail.price ? sum + detail.price * item.quantity : sum;
    }, 0);
  }, [cart, productDetails]);

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {loading && <p>Loading product details...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ul>
            {cart.map(item => {
              const detail = productDetails[item.productId];
              return (
                <li key={item.productId} className="flex items-center gap-4 py-2 border-b">
                  {detail?.image && (
                    <Image
                      src={detail.image}
                      alt={detail.product_name || 'Product image'}
                      width={50}
                      height={50}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">{detail?.product_name || 'Product'}</p>
                    <p>Price: {detail?.price ? `$${detail.price.toFixed(2)}` : 'N/A'}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        updateCartItemQuantity(item.productId, val);
                      }
                    }}
                    className="w-16 border rounded px-1 text-center"
                  />
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <h2 className="text-xl font-bold mt-4">Total: ${total.toFixed(2)}</h2>
        </>
      )}
    </div>
  );
}
