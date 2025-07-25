"use client";

import React, { useState } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css';
import { useStore } from "@/store/useStore";
import type { Product } from "@/types/product";

interface ProductDetailsClientProps {
  product: Product;
}

const FALLBACK_IMAGE = "/images/products/missing-image.png";

const getPublicImageUrl = (input?: string) => {
  if (!input) return undefined;
  const fileName = input.split("/").pop();
  if (!fileName) return undefined;
  return `/images/products/${fileName}`;
};

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 500;
const THUMB_SIZE = 80;

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ product }) => {
  const { addToCart } = useStore();

  const price = Number(product.price);
  const formattedPrice = !isNaN(price) ? price.toFixed(2) : "0.00";

  // Build array of images
  let imagesToShow: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagesToShow = product.images
      .map(getPublicImageUrl)
      .filter((src): src is string => Boolean(src));
  } else if (product.image) {
    const publicPath = getPublicImageUrl(product.image);
    if (publicPath) imagesToShow = [publicPath];
  }
  if (imagesToShow.length === 0) imagesToShow = [FALLBACK_IMAGE];

  // State for currently selected main image
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleAddToCart = () => {
    const id = typeof product._id === "number" ? product._id : Number(product._id);
    if (!isNaN(id)) addToCart(id);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT: Thumbnails */}
        {imagesToShow.length > 1 && (
          <div className="flex lg:flex-col flex-row gap-2 items-start">
            {imagesToShow.map((src, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show image ${idx + 1}`}
                onClick={() => setSelectedIdx(idx)}
                className={`border rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                  ${selectedIdx === idx ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300"}
                  bg-white`}
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                }}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  className="object-contain w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
        {/* MIDDLE: Main Image */}
        <div className="flex justify-center items-start">
          <div
            className="relative rounded overflow-hidden bg-gray-100"
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              minWidth: IMAGE_WIDTH,
              maxWidth: IMAGE_WIDTH,
            }}
          >
            <Zoom>
              <Image
                src={imagesToShow[selectedIdx]}
                alt={`${product.product_name} main image`}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                className="object-contain w-full h-full rounded"
                priority
              />
            </Zoom>
          </div>
        </div>
        {/* RIGHT: Details */}
        <div className="flex-1 flex flex-col min-w-0 max-w-xl">
          <div className="flex flex-col h-full w-full">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
              <p className="text-lg font-semibold mb-2">${formattedPrice}</p>
              {product.description && (
                <p className="mb-4 max-w-md">{product.description}</p>
              )}
            </div>
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
            {/* Spacer */}
            <div className="flex-1" />
            {/* Add to Cart button, left aligned and not stretched */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                className="bg-blue-500 text-white px-8 py-3 rounded font-bold text-lg hover:bg-blue-600 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsClient;
