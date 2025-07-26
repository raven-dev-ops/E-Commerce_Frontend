'use client';

import React, { useRef, useEffect } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import FallbackImage from '@/components/FallbackImage';
import type { Product } from '@/types/product';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showPrice?: boolean;
  showRatings?: boolean;
}

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

function getCarouselSettings(count: number) {
  return {
    dots: false,
    arrows: true,
    infinite: count > 1,
    speed: 500,
    slidesToShow: Math.min(4, count),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), arrows: true } },
      { breakpoint: 600, settings: { slidesToShow: Math.min(2, count), arrows: true } },
      { breakpoint: 480, settings: { slidesToShow: 1, arrows: true } },
    ],
  };
}

const FALLBACK_IMAGE = '/images/products/missing-image.png';

export default function ProductCarousel({
  products,
  title,
  showPrice = true,
  showRatings = false,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mb-12" ref={containerRef}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <Slider {...getCarouselSettings(products.length)}>
        {products.map(p => {
          const src = Array.isArray(p.images) && p.images[0]
            ? getPublicImageUrl(p.images[0])
            : getPublicImageUrl(p.image) || FALLBACK_IMAGE;

          const productId = p.id ?? p._id;
          const ratingValue = typeof p.average_rating === 'number' ? p.average_rating : 0;

          return (
            <div key={p._id} className="px-2">
              <div className="rounded overflow-hidden transform transition-transform duration-200 hover:scale-105 bg-white shadow flex flex-col h-full">
                <Link href={`/products/${productId}`}>
                  <a className="block h-full">
                    <div className="relative w-full h-48">
                      <FallbackImage
                        src={src}
                        alt={p.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between h-[120px]">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium truncate">
                          {p.product_name}
                        </span>
                        {showPrice && (
                          <span className="text-base font-semibold">
                            ${Number(p.price ?? 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {/* Rating */}
                      {showRatings && ratingValue > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              aria-hidden="true"
                              className={`w-4 h-4 ${i < Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.186a1 1 0 00.95.69h4.401c.969 0 1.371 1.24.588 1.81l-3.565 2.59a1 1 0 00-.364 1.118l1.357 4.186c.3.921-.755 1.688-1.54 1.118l-3.565-2.59a1 1 0 00-1.175 0l-3.565 2.59c-.784.57-1.838-.197-1.54-1.118l1.357-4.186a1 1 0 00-.364-1.118l-3.565-2.59c-.784-.57-.38-1.81.588-1.81h4.401a1 1 0 00.95-.69l1.357-4.186z"/>
                            </svg>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{ratingValue.toFixed(2)}</span>
                        </div>
                      )}
                      {/* Optionally, other info here */}
                      {/* <div className="text-xs text-gray-400 mt-1">id: {String(productId)}</div> */}
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
}
