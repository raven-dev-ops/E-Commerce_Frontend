// src/app/products/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from '@/types/product';
import ProductItem from '@/components/ProductItem';

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
  // ...other fields if needed
}

async function getAllProducts(): Promise<Product[]> {
  // Build base URL, strip trailing slash, force HTTPS
  let rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (rawBase.startsWith('http://')) {
    rawBase = rawBase.replace(/^http:\/\//, 'https://');
  }
  const base = rawBase;

  // Paginate through /products/?page=…
  let url = `${base}/products/?page=1`;
  const all: ApiResponseProduct[] = [];

  while (url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const json = await res.json();
    all.push(...(json.results as ApiResponseProduct[]));

    if (json.next) {
      // Force HTTPS on next link
      const nextUrl = json.next.replace(/^http:\/\//, 'https://');
      // Extract only the query string (?page=…)
      const parsed = new URL(nextUrl);
      url = `${base}/products/${parsed.search}`;
    } else {
      url = '';
    }
  }

  return all
    .map(p => ({
      ...p,
      _id: String(p._id),
      price: Number(p.price),
    }))
    .filter(p => p._id && p._id !== 'undefined' && p._id !== 'null');
}

const getCarouselSettings = (count: number) => ({
  dots: false,
  arrows: true,
  infinite: count > 1,
  speed: 500,
  slidesToShow: Math.min(4, count),
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), arrows: true } },
    { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), arrows: true } },
    { breakpoint: 480,  settings: { slidesToShow: 1, arrows: true } },
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
        const all = await getAllProducts();

        // Unique categories
        const cats = Array.from(new Set(
          all.map(p => p.category).filter((c): c is string => !!c)
        ));
        setCategories(cats);

        // Group by category
        const grouped: Record<string, Product[]> = {};
        cats.forEach(cat => (grouped[cat] = []));
        all.forEach(p => {
          if (p.category && grouped[p.category]) {
            grouped[p.category].push(p);
          }
        });
        setByCategory(grouped);

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Accessibility: disable focus/interaction in hidden slides
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll<HTMLElement>('.slick-slide[aria-hidden="true"]')
      .forEach(slide => {
        slide.querySelectorAll<HTMLElement>(
          'a, button, input, select, textarea, [tabindex]'
        ).forEach(el => {
          el.setAttribute('tabindex', '-1');
          if (['BUTTON','INPUT','SELECT','TEXTAREA'].includes(el.tagName)) {
            (el as any).disabled = true;
          }
        });
      });
  }, [loading, error, byCategory]);

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error   && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        categories.length === 0
          ? <p>No categories available.</p>
          : categories.map(cat => {
              const items = byCategory[cat] || [];
              if (items.length === 0) return null;
              return (
                <section key={cat} className="mb-8">
                  <h2 className="text-xl font-bold mb-3 capitalize">{cat}</h2>
                  <Slider {...getCarouselSettings(items.length)}>
                    {items.map(p => (
                      <div key={p._id} className="px-2">
                        <ProductItem product={p} />
                      </div>
                    ))}
                  </Slider>
                </section>
              );
            })
      )}
    </div>
  );
}
