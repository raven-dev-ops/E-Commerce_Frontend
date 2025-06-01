// src/components/ProductItem.tsx

"use client";

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { addItemToCart } from '@/lib/cartApi'; // Import the API function

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string; // This should now be the filename from the backend
}

interface ProductItemProps {
  product: Product;
}

// Helper function to construct the full image URL relative to /public
const getPublicImageUrl = (imageFileName?: string) => {
  if (!imageFileName) return undefined; // Or return a fallback local image path
  // Construct the path assuming images are in public/images/products/
  return `/images/products/${imageFileName}`;
};

export default function ProductItem({ product }: ProductItemProps) {
  const { addToCart } = useStore(); // Use 'addToCart' action from the store
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the addItemToCart API function
      // Assuming your backend expects { product_id: number, quantity: number }
      const addedItem = await addItemToCart({ product_id: Number(product.id), quantity: 1 });
      addToCart(Number(product.id), 1); // Update the state in your store using addToCart
    } catch (err) {
      // Handle the error and set the error state as a string
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use the helper to get the correctly constructed public path
  const publicImageUrl = getPublicImageUrl(product.image);

  return (
    <div className="border p-4 rounded flex flex-col">
      <Link href={`/products/${product.id}`} passHref>
        <div>
          {/* Use the publicImageUrl in the src prop */}
          {publicImageUrl && (
            <div className="relative w-full h-48 mb-4">
              <Image
                src={publicImageUrl}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          )}
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-700 line-clamp-2">{product.description}</p>
          <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button
        onClick={handleAddToCart} // Use the async handler
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 self-start"
      >
        Add to Cart
      </button>
    </div>
  );
}
