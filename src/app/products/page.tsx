'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import ProductCarousel from '@/components/ProductCarousel';

interface ApiResponseProduct {
  _id: string;
  id?: string;
  product_name: string;
  price: string | number;
  images?: string[];
  image?: string;
  category?: string;
  description?: string;
  ingredients?: string[];
  benefits?: string[];
  scent_profile?: string | null;
  variants?: Record<string, any>[];
  tags?: string[];
  availability?: boolean;
  variations?: Record<string, any>[];
  weight?: number | null;
  dimensions?: string | null;
  inventory?: number;
  reserved_inventory?: number;
  average_rating?: number;
  review_count?: number;
}

const CATEGORY_ORDER = ['Washes', 'Oils', 'Balms', 'Wax'];

// Utilities for converting image paths
function getPublicImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  try {
    const url = new URL(path);
    return url.pathname;
  } catch {
    // not a full URL
  }
  if (path.startsWith('/')) return path;
  return `/images/products/${path}`;
}

async function getAllProducts(): Promise<Product[]> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  const base = raw;

  let url = `${base}/products/?page=1`;
  const all: ApiResponseProduct[] = [];

  while (url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const json = await res.json();
    const batch: ApiResponseProduct[] = Array.isArray(json.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];
    all.push(...batch);

    if (json.next) {
      const next = (json.next as string).replace(/^http:\/\//, 'https://');
      const u = new URL(next);
      url = `${base}/products/${u.search}`;
    } else {
      url = '';
    }
  }

  // Map to your Product type
  return all
    .map(p => ({
      _id: String(p._id),
      id: p.id ? String(p.id) : undefined,
      product_name: p.product_name ?? "",
      price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
      images: p.images ?? [],
      image: p.image ?? undefined,
      category: p.category ?? "",
      description: p.description ?? "",
      ingredients: p.ingredients ?? [],
      benefits: p.benefits ?? [],
      scent_profile: p.scent_profile ?? null,
      variants: p.variants ?? [],
      tags: p.tags ?? [],
      availability: typeof p.availability === "boolean" ? p.availability : true,
      variations: p.variations ?? [],
      weight: typeof p.weight === "number" ? p.weight : null,
      dimensions: typeof p.dimensions === "string" ? p.dimensions : null,
      inventory: typeof p.inventory === "number" ? p.inventory : 0,
      reserved_inventory: typeof p.reserved_inventory === "number" ? p.reserved_inventory : 0,
      average_rating: typeof p.average_rating === "number" ? p.average_rating : 0,
      review_count: typeof p.review_count === "number" ? p.review_count : 0,
    }))
    .filter(p => p._id && p._id !== 'undefined' && p._id !== 'null');
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [byCategory, setByCategory] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const grouped: Record<string, Product[]> = {};
        CATEGORY_ORDER.forEach(cat => grouped[cat] = []);
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

  if (loading) return <p className="p-4">Loading products…</p>;
  if (error)   return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      {CATEGORY_ORDER.map(cat => {
        const items = byCategory[cat] || [];
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            {/* This div centers & limits width just like ProductDetailsClient */}
            <div className="max-w-6xl mx-auto">
              <ProductCarousel
                products={items}
                title={cat}
                showPrice
                showRatings
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
