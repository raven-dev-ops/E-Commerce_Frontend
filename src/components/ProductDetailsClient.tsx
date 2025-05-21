"use client";
import React from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";

interface Product {
  _id: string | number;
  product_name: string;
  price: number | string;
  description?: string;
  image?: string;
  images?: string[];
  ingredients?: string[];
  benefits?: string[];
}

interface ProductDetailsClientProps {
  product: Product;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({
  product,
}) => {
  const { addToCart } = useStore();

  return (
    <div className="container mx-auto p-4">
      {/* Image Gallery or Single Image */}
      {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {product.images.map((imgSrc: string, index: number) => (
            <div key={index} className="relative w-full h-48">
              <Image
                src={imgSrc}
                alt={`${product.product_name} image ${index + 1}`}
                fill
                className="rounded object-cover"
              />
            </div>
          ))}
        </div>
      ) : product.image ? (
        <div className="relative w-full h-64 mb-4">
          <Image
            src={product.image}
            alt={product.product_name}
            fill
            className="rounded object-cover"
          />
        </div>
      ) : null}

      <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
      <p className="text-lg font-semibold mb-2">
        $
        {product.price !== undefined && !isNaN(Number(product.price))
          ? Number(product.price).toFixed(2)
          : "0.00"}
      </p>
      <p>{product.description}</p>

      <button
        onClick={() => {
          if (product && product._id !== undefined) {
            // Convert _id to number before calling addToCart
            const idAsNumber = typeof product._id === "number" ? product._id : Number(product._id);
            addToCart(idAsNumber);
          }
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>

      {/* Ingredients */}
      {product.ingredients &&
        Array.isArray(product.ingredients) &&
        product.ingredients.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">Ingredients</h2>
            <ul className="list-disc list-inside">
              {product.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Benefits */}
      {product.benefits &&
        Array.isArray(product.benefits) &&
        product.benefits.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">Benefits</h2>
            <ul className="list-disc list-inside">
              {product.benefits.map((benefit: string, index: number) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default ProductDetailsClient;
