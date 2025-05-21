"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useStore } from '@/store/useStore';

interface Product {
  _id: string | number;
  product_name: string;
  price: number;
  description?: string;
  image?: string;
  images?: string[];
  ingredients?: string[];
  benefits?: string[];
}

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useStore();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else {
          setError('Failed to fetch product details.');
        }
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  // Assuming product data structure includes product_name, price, description,
  // and optionally images (array of strings), image (string), ingredients (array of strings), benefits (array of strings)
  return (
    <>
    <div className="container mx-auto p-4">
      {/* Image Gallery or Single Image */}
      {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {product.images.map((imgSrc: string, index: number) => (
            <div key={index} className="relative w-full h-48">
              <Image
                src={imgSrc}
                alt={`${product.product_name} image ${index + 1}`}
                fill className="rounded object-cover"
              />
            </div>
          ))}
        </div>
      ) : product.image ? (
        <div className="relative w-full h-64 mb-4">
          <Image
            src={product.image}
            alt={product.product_name}
            fill className="rounded object-cover"
          />
        </div>

      ) : null}
      <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
      <p className="text-lg font-semibold mb-2">${product.price}</p>
      <p>{product.description}</p>
      <button
        onClick={() => {
          if (product && product._id !== undefined) {
            addToCart(product._id);
          }
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>

      {/* Ingredients */}
      {product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
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
      {product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 && (
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
    </>
  );
}
