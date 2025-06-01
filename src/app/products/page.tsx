'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import type { Product } from '@/types/product';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ApiResponseProduct {
  id: string;
  _id?: string | { $oid: string } | null | undefined;
  product_name: string;
  price: string | number;
  description?: string;
  image?: string;
  images?: string[];
  ingredients?: string[];
  benefits?: string[];
  category?: string;
  variants?: any[];
  tags?: string[];
  availability?: boolean;
  variations?: any[];
  weight?: number | null;
  dimensions?: any | null;
  inventory?: number;
  reserved_inventory?: number;
  average_rating?: number;
  review_count?: number;
}

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1)
    : process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}/products/`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();

  const products = data.results.map((product: ApiResponseProduct): Product => ({
    ...product,
    _id: String(product.id),
    price: Number(product.price),
  }));

  const filteredProducts = products.filter((product: Product) => {
    const isValidId =
      typeof product._id === 'string' &&
      product._id.length > 0 &&
      product._id !== 'undefined' &&
      product._id !== 'null';
    return isValidId;
  });

  return filteredProducts;
}

// Carousel settings generator for consistent card sizing
const getCarouselSettings = (itemCount: number) => {
  return {
    dots: itemCount >= 4,
    infinite: itemCount >= 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: itemCount >= 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, itemCount),
          slidesToScroll: 1,
          infinite: itemCount >= 3,
          dots: itemCount >= 3,
          arrows: itemCount >= 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: Math.min(2, itemCount),
          slidesToScroll: 1,
          infinite: itemCount >= 2,
          dots: itemCount >= 2,
          arrows: itemCount >= 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
          arrows: false,
        },
      },
    ],
  };
};

const FALLBACK_IMAGE = "/images/products/beard-balm.jpg";
const getProductImage = (product: Product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const fileName = product.images[0]?.split("/").pop();
    return fileName ? `/images/products/${fileName}` : FALLBACK_IMAGE;
  }
  if (product.image) {
    const fileName = product.image.split("/").pop();
    return fileName ? `/images/products/${fileName}` : FALLBACK_IMAGE;
  }
  return FALLBACK_IMAGE;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: Product[] }>({});

  const categories = ['Balms', 'Washes', 'Oils', 'Wax', 'Soap'];

  useEffect(() => {
    (async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        const grouped: { [key: string]: Product[] } = {};
        categories.forEach(category => {
          grouped[category] = [];
        });

        fetchedProducts.forEach(product => {
          if (
            typeof product.category === 'string' &&
            product.category &&
            categories.includes(product.category)
          ) {
            grouped[product.category].push(product);
          }
        });

        setProductsByCategory(grouped);
      } catch {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        categories.length === 0 ? (
          <p>No defined categories.</p>
        ) : (
          <div>
            {categories.map(category => {
              const items = productsByCategory[category] || [];
              if (items.length === 0) return null;

              const carouselSettings = getCarouselSettings(items.length);

              return (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{category}</h2>
                  <Slider {...carouselSettings}>
                    {items.map(p => (
                      <div key={p._id} className="px-2">
                        <Link
                          href={`/products/${p._id}`}
                          className="block group cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-blue-400 transition bg-white"
                          tabIndex={0}
                          aria-label={`View details for ${p.product_name}`}
                          style={{ outline: "none" }} // ensures outline never stacks with ring
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-full h-48 bg-gray-100 overflow-hidden rounded-xl flex items-center justify-center p-2">
                              <Image
                                src={getProductImage(p)}
                                alt={p.product_name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 25vw"
                                priority={false}
                              />
                            </div>
                            <div className="w-full flex flex-col items-center gap-1 mt-2 px-1 pb-2">
                              <span className="text-sm font-semibold text-gray-900 text-center truncate w-full">{p.product_name}</span>
                              <span className="text-sm font-bold text-blue-600">${Number(p.price).toFixed(2)}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </Slider>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
