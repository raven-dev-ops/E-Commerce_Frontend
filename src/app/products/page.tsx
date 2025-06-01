// src/app/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

// Import Slider component and styles for react-slick
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define an interface for the raw product data from the API response
interface ApiResponseProduct {
  id: string; // Backend sends ID as 'id' string
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

  // Map the raw API response to the Product type, using 'id' for _id and normalizing price
  const products = data.results.map((product: ApiResponseProduct): Product => ({
    ...product,
    _id: String(product.id),
    price: Number(product.price),
  }));

  // Filter out products where _id is not a valid non-empty string
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

// Fallback image path for empty categories
const FALLBACK_IMAGE_PLACEHOLDER = '/images/products/beard-balm.jpg';

// Main Products Page
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: Product[] }>({});

  // Define the target categories
  const categories = ['Balms', 'Washes', 'Oils', 'Wax', 'Soap'];

  useEffect(() => {
    (async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        // Group products by category, initializing with all target categories
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // react-slick settings for multiple items
  const multiItemSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // react-slick settings for single item
  const singleItemSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

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
              const hasProducts =
                productsByCategory[category] &&
                productsByCategory[category].length > 0;

              const currentSettings = hasProducts
                ? multiItemSettings
                : singleItemSettings;

              return (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{category}</h2>
                  <Slider {...currentSettings}>
                    {hasProducts ? (
                      productsByCategory[category].map(p => (
                        <div key={p._id} className="px-2">
                          <ProductItem product={p} />
                        </div>
                      ))
                    ) : (
                      // Single, flat placeholder slide
                      <div className="flex flex-col items-center justify-center py-12">
                        <img
                          src={FALLBACK_IMAGE_PLACEHOLDER}
                          alt="No products available"
                          className="h-32 w-auto object-contain mb-4"
                          draggable={false}
                        />
                        <p className="text-gray-500">
                          No products available in this category.
                        </p>
                      </div>
                    )}
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
