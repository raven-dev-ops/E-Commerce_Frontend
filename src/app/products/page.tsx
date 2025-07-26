'use client';

import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from '@/types/product';
import ProductItem from '@/components/ProductItem';

// ApiResponse shape
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

async function getProducts(): Promise<Product[]> {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const res = await fetch(`${base}/products/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return (data.results as ApiResponseProduct[])
    .map((p) => ({
      ...p,
      _id: String(p._id),
      price: Number(p.price),
    }))
    .filter(p =>
      p._id &&
      p._id !== 'undefined' &&
      p._id !== 'null'
    );
}

const getCarouselSettings = (count: number) => ({
  dots: false,
  arrows: true,
  infinite: count > 1,
  speed: 500,
  slidesToShow: Math.min(4, count),
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), slidesToScroll: 1, infinite: count > 1, arrows: true } },
    { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), slidesToScroll: 1, infinite: count > 1, arrows: true } },
    { breakpoint: 480,  settings: { slidesToShow: 1,              slidesToScroll: 1, infinite: false,   arrows: true } },
  ],
});

export default function ProductsPage() {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, Product[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getProducts();
        const cats = Array.from(new Set(
          all.map((p) => p.category).filter((c): c is string => !!c)
        ));
        setCategories(cats);

        const grouped: Record<string, Product[]> = {};
        cats.forEach((c) => { grouped[c] = []; });
        all.forEach((p) => {
          if (p.category && grouped[p.category]) {
            grouped[p.category].push(p);
          }
        });
        setByCategory(grouped);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Accessibility: disable focus in hidden slides
  useEffect(() => {
    const disableHidden = () => {
      containerRef.current
        ?.querySelectorAll<HTMLElement>('.slick-slide[aria-hidden="true"]')
        .forEach((slide) => {
          slide
            .querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]')
            .forEach((el) => {
              el.setAttribute('tabindex', '-1');
              if (['BUTTON','INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
                (el as any).disabled = true;
              }
            });
        });
    };
    if (!loading && !error) disableHidden();
  }, [loading, error, byCategory]);

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error   && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        categories.length === 0
          ? <p>No categories available.</p>
          : categories.map((cat: string) => {
              const items = byCategory[cat] || [];
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{cat}</h2>
                  <Slider {...getCarouselSettings(items.length)}>
                    {items.map((p: Product) => (
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
