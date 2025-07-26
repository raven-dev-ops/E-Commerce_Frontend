'use client';

import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from '@/types/product';
import ProductItem from '@/components/ProductItem';

// ApiResponseProduct shape for all endpoints
interface ApiResponseProduct {
  _id: string;
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

// Fetch and merge all categories in one go
async function getProducts(): Promise<Product[]> {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const endpoints = ['/products/', '/oils/', '/balms/', '/washes/'];
  
  // Fire off all requests in parallel
  const responses = await Promise.all(
    endpoints.map(p => fetch(`${base}${p}`, { cache: 'no-store' }))
  );
  if (!responses.every(r => r.ok)) {
    throw new Error('Failed to fetch one or more product categories');
  }

  // Parse JSON for each
  const jsons = await Promise.all(responses.map(r => r.json()));
  // Each JSON assumed to have a `.results` array
  const allRawItems: ApiResponseProduct[] = jsons.flatMap((data: any) => data.results);

  // Normalize ID and price
  return allRawItems
    .map(item => ({
      ...item,
      _id: String(item._id),
      price: Number(item.price),
    }))
    .filter(p =>
      typeof p._id === 'string' &&
      p._id.length > 0 &&
      p._id !== 'undefined' &&
      p._id !== 'null'
    );
}

// Carousel settings: always arrows, never dots
const getCarouselSettings = (count: number) => ({
  dots: false,
  arrows: true,
  infinite: count > 1,
  speed: 500,
  slidesToShow: Math.min(4, count),
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: Math.min(3, count),
        slidesToScroll: 1,
        infinite: count > 1,
        dots: false,
        arrows: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: Math.min(2, count),
        slidesToScroll: 1,
        infinite: count > 1,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: Product[] }>({});
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Fetch & group
  useEffect(() => {
    (async () => {
      try {
        const allProducts = await getProducts();

        // extract unique, non-empty category strings
        const uniqueCats = Array.from(
          new Set(allProducts
            .map(p => p.category)
            .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
          )
        );

        setCategories(uniqueCats);

        // group by category
        const grouped: { [key: string]: Product[] } = {};
        uniqueCats.forEach(cat => { grouped[cat] = []; });
        allProducts.forEach(prod => {
          if (prod.category && grouped[prod.category]) {
            grouped[prod.category].push(prod);
          }
        });
        setProductsByCategory(grouped);
      } catch {
        setError('Failed to fetch products across all categories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Accessibility: strip focus/interaction from hidden slides
  useEffect(() => {
    if (!sliderContainerRef.current) return;
    const disableHidden = () => {
      sliderContainerRef.current!
        .querySelectorAll<HTMLElement>('.slick-slide[aria-hidden="true"]')
        .forEach(slide => {
          slide.querySelectorAll<HTMLElement>(
            'a, button, input, select, textarea, [tabindex]'
          ).forEach(el => {
            el.setAttribute('tabindex', '-1');
            if (['BUTTON','INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
              (el as HTMLButtonElement).disabled = true;
            }
          });
        });
    };
    disableHidden();
    // If you want to re‐run on slide change:
    // const slick = sliderContainerRef.current.querySelector('.slick-slider');
    // slick?.addEventListener('afterChange', disableHidden);
    // return () => slick?.removeEventListener('afterChange', disableHidden);
  }, [loading, error, productsByCategory]);

  return (
    <div className="container mx-auto p-4" ref={sliderContainerRef}>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        categories.length === 0
          ? <p>No categories found.</p>
          : categories.map(cat => {
              const items = productsByCategory[cat] || [];
              if (!items.length) return null;
              return (
                <div key={cat} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{cat}</h2>
                  <Slider {...getCarouselSettings(items.length)}>
                    {items.map(p => (
                      <div key={p._id} className="px-2">
                        <ProductItem product={p} />
                      </div>
                    ))}
                  </Slider>
                </div>
              );
            })
      )}
    </div>
  );
}
