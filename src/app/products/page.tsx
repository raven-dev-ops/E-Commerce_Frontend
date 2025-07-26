// src/app/products/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';
import type { Product } from '@/types/product';
import FallbackImage from '@/components/FallbackImage';

interface ApiResponseProduct {
  _id: string;
  product_name: string;
  price: string | number;
  images?: string[];
  image?: string;
  category?: string;
}

const CATEGORY_ORDER = ['Washes', 'Oils', 'Balms', 'Wax'];

/**
 * Given whatever the API returns (absolute URL, absolute path, or bare filename),
 * return the correct `/images/...` path, preserving any sub‑folders.
 */
function getPublicImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  try {
    // if it's a full URL, grab its pathname
    const url = new URL(path);
    return url.pathname;
  } catch {
    // not an absolute URL
  }
  // already an absolute path?
  if (path.startsWith('/')) {
    return path;
  }
  // otherwise assume it's a filename under /images/products/
  return `/images/products/${path}`;
}

async function getAllProducts(): Promise<Product[]> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  // ensure /api prefix
  const base = raw.endsWith('/api') ? raw : `${raw}/api`;

  let url = `${base}/products/?page=1`;
  const all: ApiResponseProduct[] = [];

  while (url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const json = await res.json();
    // support both paginated { results: [...] } and plain array
    const batch: ApiResponseProduct[] = Array.isArray(json.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];
    all.push(...batch);

    // advance to next page, if provided
    if (json.next) {
      // force HTTPS, preserve only the querystring
      const next = (json.next as string).replace(/^http:\/\//, 'https://');
      const u = new URL(next);
      url = `${base}/products/${u.search}`;
    } else {
      url = '';
    }
  }

  return all
    .map(p => ({
      _id:          String(p._id),
      product_name: p.product_name,
      price:        Number(p.price),
      images:       p.images,
      image:        p.image,
      category:     p.category,
    }))
    .filter(p => p._id && p._id !== 'undefined' && p._id !== 'null');
}

function getCarouselSettings(count: number) {
  return {
    dots:           false,
    arrows:         true,
    infinite:       count > 1,
    speed:          500,
    slidesToShow:   Math.min(4, count),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), arrows: true } },
      { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), arrows: true } },
      { breakpoint: 480,  settings: { slidesToShow: 1, arrows: true } },
    ],
  };
}

export default function ProductsPage() {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [byCategory, setByCategory] = useState<Record<string, Product[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const grouped: Record<string, Product[]> = {};
        CATEGORY_ORDER.forEach(cat => (grouped[cat] = []));
        all.forEach(p => {
          const cat = p.category || '';
          if (grouped[cat]) grouped[cat].push(p);
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

  // Accessibility: disable focus in hidden slides
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.slick-slide[aria-hidden="true"]')
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

  if (loading) return <p className="p-4">Loading products…</p>;
  if (error)   return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      {CATEGORY_ORDER.map(cat => {
        const items = byCategory[cat] || [];
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            <Slider {...getCarouselSettings(items.length)}>
              {items.map(p => {
                const src = Array.isArray(p.images) && p.images[0]
                  ? getPublicImageUrl(p.images[0])
                  : getPublicImageUrl(p.image);

                return (
                  <div key={p._id} className="px-2">
                    <div className="rounded overflow-hidden">
                      <Link href={`/products/${p._id}`}>
                        <a className="block">
                          <div className="relative w-full h-48">
                            <FallbackImage
                              src={src}
                              alt={p.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-medium">
                                {p.product_name}
                              </span>
                              <span className="text-base font-semibold">
                                ${p.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </a>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </section>
        );
      })}
    </div>
  );
}
