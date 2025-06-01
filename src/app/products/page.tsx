// src/app/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

// Import Slider component and styles for react-slick
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import Image component for placeholder
import Image from 'next/image';

// Define an interface for the raw product data from the API response
interface ApiResponseProduct {
  id: string; // Backend sends ID as 'id' string
  _id?: string | { $oid: string } | null | undefined; // Keep this optional if the backend might still send it
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

  console.log('Fetching products from:', url);

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();

  // Map the raw API response to the Product type, using 'id' for _id and normalizing price
  const products = data.results.map((product: ApiResponseProduct): Product => ({
    ...product,
    _id: String(product.id), // Use product.id from the backend response
    price: Number(product.price), // Ensure price is a number
  }));

  // Filter out products where _id is not a valid non-empty string
  const filteredProducts = products.filter((product: Product) => { 
    const isValidId = typeof product._id === 'string' && product._id.length > 0 && product._id !== 'undefined' && product._id !== 'null';
    if (!isValidId) {
      console.warn(`Filtering out product with invalid _id: ${product.product_name || 'Unknown Product'}`);
    }
    return isValidId;
  });

  return filteredProducts;
}

// Define fallback image path for empty categories
const FALLBACK_IMAGE_PLACEHOLDER = '/images/products/beard-balm.jpg'; // Using the same fallback as ProductItem for consistency

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
          grouped[category] = []; // Initialize each target category with an empty array
        });

        fetchedProducts.forEach(product => {
          // Only group if product.category is a non-empty string and is one of the target categories
          if (typeof product.category === 'string' && product.category && categories.includes(product.category)) {
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

  // Settings for react-slick carousel with multiple items
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
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Settings for react-slick carousel with a single item (placeholder)
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
              // Determine which settings to use based on whether there are products in the category
              const currentSettings = productsByCategory[category] && productsByCategory[category].length > 0
                ? multiItemSettings
                : singleItemSettings;

              console.log(`Category: ${category}, Using settings:`, currentSettings);

              return (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{category}</h2>
                  <Slider {...currentSettings}> {/* Use the determined settings */}
                    {productsByCategory[category] && productsByCategory[category].length > 0 ? (
                      productsByCategory[category].map(p => (
                        <div key={p._id} className="px-2"> {/* Added padding for spacing in carousel */}
                          <ProductItem product={p} />
                        </div>
                      ))
                    ) : (
                      // Placeholder content for empty categories, wrapped to be treated as a single slide
                      <div className="px-2"> 
                        <div className="border p-4 rounded flex flex-col items-center justify-center h-full text-center"> {/* Adjusted styling for placeholder container */}
                           <div className="relative w-full h-48 mb-4"> {/* Container for the image */} 
                            <Image
                              src={FALLBACK_IMAGE_PLACEHOLDER}
                              alt="No products available placeholder"
                              fill
                              className="rounded object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                           </div>
                          <p>No products available in this category.</p>
                        </div>
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
