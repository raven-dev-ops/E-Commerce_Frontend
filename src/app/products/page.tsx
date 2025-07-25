'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from '@/types/product';

// import ProductCard from './ProductCard'; // if using ProductCard
import ProductItem from '@/components/ProductItem';

interface ApiResponseProduct {
  id?: string;
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

  const products = data.results.map((product: ApiResponseProduct): Product => {
    let id = '';
    if (typeof product.id === 'string' && product.id) {
      id = product.id;
    } else if (typeof product._id === 'string' && product._id) {
      id = product._id;
    } else if (
      typeof product._id === 'object' &&
      product._id &&
      '$oid' in product._id
    ) {
      id = (product._id as { $oid: string }).$oid;
    }
    return {
      ...product,
      _id: id,
      price: Number(product.price),
    };
  });

  return products.filter(
    (product: Product) =>
      typeof product._id === 'string' &&
      product._id.length > 0 &&
      product._id !== 'undefined' &&
      product._id !== 'null'
  );
}

// Show arrows, but never dots
const getCarouselSettings = (itemCount: number) => ({
  dots: false,
  arrows: true,
  infinite: itemCount > 1,
  speed: 500,
  slidesToShow: Math.min(4, itemCount),
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: Math.min(3, itemCount),
        slidesToScroll: 1,
        infinite: itemCount > 1,
        dots: false,
        arrows: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: Math.min(2, itemCount),
        slidesToScroll: 1,
        infinite: itemCount > 1,
        dots: false,
        arrows: true,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
        arrows: true,
      },
    },
  ],
});

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
                        <ProductItem product={p} />
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
