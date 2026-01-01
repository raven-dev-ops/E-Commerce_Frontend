"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { getApiErrorMessage } from '@/lib/api';
import { fetchProductSummary } from '@/lib/productCache';
import { useRouter } from "next/navigation";
import Image from "next/image";

type ProductDetail = {
  _id?: string | number;
  product_name?: string;
  price?: number;
  image?: string;
  error?: boolean;
  message?: string;
};

const fetchProductDetails = async (
  productId: string | number
): Promise<ProductDetail> => {
  try {
    const parsed = await fetchProductSummary(productId);
    return {
      _id: parsed.id,
      product_name: parsed.product_name,
      price: parsed.price,
      image: parsed.image,
    };
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "An unknown error occurred");
    return { error: true, message };
  }
};

export default function CartPage() {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    isAuthenticated,
    authHydrated,
    cartSyncStatus,
    syncCartFromServer,
    cartMergeNotice,
    clearCartMergeNotice,
  } = useStore();
  const [productDetails, setProductDetails] = useState<
    Record<string | number, ProductDetail | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Authentication check effect
  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;

    const fetchAllDetails = async () => {
      setLoading(true);
      const ids = Array.from(new Set(cart.map((item) => item.productId)));
      const detailMap: Record<string | number, ProductDetail | null> = {};

      await Promise.all(
        ids.map(async (id) => {
          const detail = await fetchProductDetails(id);
          detailMap[id] = detail;
        })
      );

      setProductDetails(detailMap);

      if (Object.values(detailMap).some((d) => d?.error)) {
        setError("Some product details failed to load.");
      }

      setLoading(false);
    };

    if (cart.length > 0) {
      fetchAllDetails();
    } else {
      setProductDetails({});
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, authHydrated, isAuthenticated]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const detail = productDetails[item.productId];
      return detail?.price && !detail?.error
        ? sum + detail.price * item.quantity
        : sum;
    }, 0);
  }, [cart, productDetails]);

  if (authHydrated && !isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  if (authHydrated && cart.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {cartSyncStatus === 'loading' && (
        <div className="mb-4 text-sm text-gray-600">Syncing cart with server...</div>
      )}
      {cartSyncStatus === 'error' && (
        <div className="mb-4 text-sm text-red-600">
          Cart sync failed.{' '}
          <button
            type="button"
            className="underline"
            onClick={() => syncCartFromServer()}
          >
            Retry
          </button>
        </div>
      )}
      {cartMergeNotice && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span>{cartMergeNotice}</span>
          <button
            type="button"
            className="text-amber-900 underline"
            onClick={() => clearCartMergeNotice()}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading && <p>Loading product details...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-4">
        {cart.map((item) => {
          const detail = productDetails[item.productId];
          const isErrored = detail?.error;

          return (
            <li
              key={item.productId}
              className="flex items-center gap-4 p-4 border rounded-md shadow-sm bg-white"
            >
              {detail?.image && !isErrored && (
                <Image
                  src={detail.image}
                  alt={detail.product_name || "Product"}
                  width={50}
                  height={50}
                  className="rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {detail?.product_name || "Product name unavailable"}
                </p>
                <p className="text-sm text-gray-600">
                  Price:{" "}
                  {detail?.price && !isErrored
                    ? `$${detail.price.toFixed(2)}`
                    : "Unavailable"}
                </p>
              </div>
              <input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    updateCartItemQuantity(item.productId, val);
                  }
                }}
                className="w-16 border rounded text-center"
              />
              <button
                onClick={() => removeFromCart(item.productId)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="text-xl font-bold mt-6">Total: ${total.toFixed(2)}</h2>
    </div>
  );
}
