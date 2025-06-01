// src/components/ProductDetailsClient.tsx

"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";

interface Product {
  _id: string | number;
  product_name: string;
  price: number | string;
  description?: string;
  image?: string; // This should now be the filename from the backend
  images?: string[]; // These should also be filenames
  ingredients?: string[];
  benefits?: string[];
}

interface ProductDetailsClientProps {
  product: Product;
}

const FALLBACK_IMAGE = "/images/beard-balm.jpg"; // Use your real fallback image path in the public directory

// Helper function to construct the full image URL relative to /public
const getPublicImageUrl = (imageFileName?: string) => {
  if (!imageFileName) return undefined; // Or return a fallback local image path
  // Assuming images are in public/images/products/ and backend provides just the filename
  // If backend provides a path like /media/products/filename.jpg, you might need to adjust this
  const fileName = imageFileName.split('/').pop(); // Extract filename if path is provided
  if (!fileName) return undefined; // Handle cases where split fails
  return `/images/products/${fileName}`;
};

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ product }) => {
  const { addToCart } = useStore();

  const handleAddToCart = () => {
    const id = typeof product._id === "number" ? product._id : Number(product._id);
    if (!isNaN(id)) addToCart(id);
  };

  const price = Number(product.price);
  const formattedPrice = !isNaN(price) ? price.toFixed(2) : "0.00";

  // Determine which images to show, using the helper to get public paths
  let imagesToShow: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagesToShow = product.images.map(img => getPublicImageUrl(img)).filter(Boolean) as string[]; // Map and filter out any undefined
  } else if (product.image) {
    const publicPath = getPublicImageUrl(product.image);
    if (publicPath) imagesToShow = [publicPath];
  }

  // If no images are found, use the fallback
  if (imagesToShow.length === 0) {
    imagesToShow = [FALLBACK_IMAGE];
  }

  return (
    <div className="container mx-auto p-4">
      {/* Image Gallery */}
      <div className={`grid ${imagesToShow.length > 1 ? "grid-cols-2 md:grid-cols-3 gap-4 mb-4" : ""}`}>
        {imagesToShow.map((src, i) => (
          <div key={i} className="relative w-full h-48 mb-4">
            <Image
              src={src}
              alt={`${product.product_name} image ${i + 1}`}
              fill
              className="rounded object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Product Info */}
      <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
      <p className="text-lg font-semibold mb-2">${formattedPrice}</p>
      {product.description && <p className="mb-4">{product.description}</p>}

      <button
        onClick={handleAddToCart}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>

      {/* Ingredients */}
      {Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Ingredients</h2>
          <ul className="list-disc list-inside">
            {product.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {Array.isArray(product.benefits) && product.benefits.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Benefits</h2>
          <ul className="list-disc list-inside">
            {product.benefits.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsClient;
