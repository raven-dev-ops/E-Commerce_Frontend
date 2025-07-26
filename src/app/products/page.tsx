'use client';

import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Product } from '@/types/product';
import ProductItem from '@/components/ProductItem';

// Now _id is always a string, so we simplify types:
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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.endsWith('/')
    ? process.env.NEXT_PUBLIC_API_BASE_URL.slice(0, -1)
    : process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}/products/`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();

  // We expect _id to be a string already
  const products = data.results.map((product: ApiResponseProduct): Product => ({
    ...product,
    _id: String(product._id),
    price: Number(product.price),
  }));

  // Filter only valid _id values
  return products.filter(
    (product: Product) =>
      typeof product._id === 'string' &&
      product._id.length > 0 &&
      product._id !== 'undefined' &&
      product._id !== 'null'
  );
}

// Carousel settings: Show arrows, never dots
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: Product[] }>({});

  // Ref to the slider container so we can post-process its slides
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const fetchedProducts = await getProducts();

        // Dynamic categories from available products
        const uniqueCategories = Array.from(
          new Set(
            fetchedProducts
              .map(p => p.category)
              .filter((cat): cat is string => typeof cat === 'string' && cat.length > 0)
          )
        );

        setCategories(uniqueCategories);

        // Group products by category
        const grouped: { [key: string]: Product[] } = {};
        uniqueCategories.forEach(category => {
          grouped[category] = [];
        });

        fetchedProducts.forEach(product => {
          if (
            typeof product.category === 'string' &&
            product.category &&
            uniqueCategories.includes(product.category)
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

  // Accessibility fix: disable focus on slides marked aria-hidden="true"
  useEffect(() => {
    if (!sliderContainerRef.current) return;

    const disableFocusInHiddenSlides = () => {
      const hiddenSlides = sliderContainerRef.current!.querySelectorAll<HTMLElement>(
        '.slick-slide[aria-hidden="true"]'
      );
      hiddenSlides.forEach(slide => {
        // All normally focusable selectors
        const focusable = slide.querySelectorAll<HTMLElement>(
          'a[href], button, input, textarea, select, [tabindex]'
        );
        focusable.forEach(el => {
          el.setAttribute('tabindex', '-1');
          // disable interactive elements too
          if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
            (el as HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).disabled = true;
          }
        });
      });
    };

    // initial run
    disableFocusInHiddenSlides();

    // if you want to re-run on slider change, uncomment this:
    // sliderContainerRef.current
    //   ?.querySelector('.slick-slider')
    //   ?.addEventListener('afterChange', disableFocusInHiddenSlides);

    // cleanup if you added an event listener
    // return () => {
    //   sliderContainerRef.current
    //     ?.querySelector('.slick-slider')
    //     ?.removeEventListener('afterChange', disableFocusInHiddenSlides);
    // };
  }, [loading, error, productsByCategory]);

  return (
    <div className="container mx-auto p-4" ref={sliderContainerRef}>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {loading && <p>Loading products…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        categories.length === 0 ? (
          <p>No categories found.</p>
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
