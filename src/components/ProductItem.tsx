// src/components/ProductItem.tsx

"use client";

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { addItemToCart } from '@/lib/cartApi'; // Import the API function
import type { Product } from '@/types/product'; // Import the shared Product type

// Helper function to construct the full image URL relative to /public
const getPublicImageUrl = (imageFileName?: string) => {
  if (!imageFileName) return undefined; // Or return a fallback local image path
  // Construct the path assuming images are in public/images/products/
  // Extract filename if backend provides a path like /media/products/filename.jpg
  const fileName = imageFileName.split('/').pop();
  if (!fileName) return undefined; // Handle cases where split fails
  return `/images/products/${fileName}`;
};

interface ProductItemProps {
  product: Product; // Use the imported Product type
}

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
      // Use product._id and convert to Number if necessary for the API call
      const addedItem = await addItemToCart({ product_id: Number(product._id), quantity: 1 });
      addToCart(Number(product._id), 1); // Update the state in your store using addToCart
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

  // Use the helper to get the correctly constructed public path, using product.image
  const publicImageUrl = getPublicImageUrl(product.image);

  return (
    <div className="border p-4 rounded flex flex-col">
      {/* Use product._id for the Link href */}
      <Link href={`/products/${product._id}`} passHref>
        <div>
          {/* Use the publicImageUrl in the src prop */}
          {publicImageUrl && (
            <div className="relative w-full h-48 mb-4">
              {/* Use product.product_name for alt text */}
              <Image
                src={publicImageUrl}
                alt={product.product_name}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          )}
          {/* Use product.product_name for the heading */}
          <h2 className="text-xl font-semibold">{product.product_name}</h2>
          <p className="text-gray-700 line-clamp-2">{product.description}</p>
          {/* Ensure price is treated as a number before toFixed */}
          <p className="text-lg font-bold mt-2">${Number(product.price).toFixed(2)}</p>
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
