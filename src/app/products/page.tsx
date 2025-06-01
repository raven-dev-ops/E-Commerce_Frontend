// src/app/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

// Import Slider component and styles for react-slick
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1)
    : process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}/products/`;

  console.log('Fetching products from:', url);

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();
  // Normalize _id to always be a string
  return data.results.map((product: any) => ({
    ...product,
    _id: typeof product._id === "object" && product._id !== null && "$oid" in product._id
      ? product._id.$oid
      : product._id,
    price: Number(product.price),
  }));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: Product[] }>({});

  useEffect(() => {
    (async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        // Group products by category, ensuring category is a string
        const grouped: { [key: string]: Product[] } = {};
        fetchedProducts.forEach(product => {
          // Only group if product.category is a non-empty string
          if (typeof product.category === 'string' && product.category) {
            if (!grouped[product.category]) {
              grouped[product.category] = [];
            }
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

  // Settings for react-slick carousel
  const settings = {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        Object.keys(productsByCategory).length === 0 ? (
          <p>{products.length === 0 ? 'No products available.' : 'No categories found or categories are not strings.'}</p>
        ) : (
          <div>
            {Object.keys(productsByCategory).map(category => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-bold mb-3 capitalize">{category}</h2>
                <Slider {...settings}>
                  {productsByCategory[category].map(p => (
                    <div key={p._id} className="px-2"> {/* Added padding for spacing in carousel */}
                      <ProductItem product={p} />
                    </div>
                  ))}
                </Slider>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
