"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface ProductItemProps {
  product: Product;
}

export default function ProductItem({ product }: ProductItemProps) {
  const { addToCart } = useStore();

  const handleAddToCart = () => {
    addToCart(Number(product.id)); // Convert string ID to number here
  };

  return (
    <div className="border p-4 rounded flex flex-col">
      <Link href={`/products/${product.id}`} passHref>
        <div>
          {product.image && (
            <div className="relative w-full h-48 mb-4">
              <Image
                src={product.image}
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
        onClick={handleAddToCart}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 self-start"
      >
        Add to Cart
      </button>
    </div>
  );
}
