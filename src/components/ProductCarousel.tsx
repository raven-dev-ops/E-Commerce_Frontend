'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FallbackImage from '@/components/FallbackImage';
import type { Product } from '@/types/product';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showPrice?: boolean;
  showRatings?: boolean;
}

const ArrowButton = ({
  onClick,
  left,
}: {
  onClick?: () => void;
  left?: boolean;
}) => (
  <button
    type="button"
    aria-label={left ? 'Previous' : 'Next'}
    onClick={onClick}
    className={`
      absolute z-10
      ${left ? '-left-8' : '-right-8'}
      bg-transparent border-none outline-none
      flex items-center justify-center w-10 h-10 cursor-pointer
      transition-transform duration-200 hover:scale-125
    `}
    style={{
      // Move up 5px from vertical center
      top: 'calc(50% - 5px)',
      padding: 0,
      boxShadow: 'none',
      background: 'none',
    }}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path
        d={
          left
            ? 'M18.5 23L12 14L18.5 5'
            : 'M9.5 5L16 14L9.5 23'
        }
        stroke="black"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

function getPublicImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('images/')) return '/' + path;
  if (path.includes('images/products/')) {
    return path.startsWith('/') ? path : '/' + path;
  }
  return `/images/products/${path}`;
}

function getCarouselSettings(count: number, afterChange: () => void) {
  return {
    dots: false,
    arrows: true,
    infinite: count > 1,
    speed: 500,
    slidesToShow: Math.min(4, count),
    slidesToScroll: 1,
    prevArrow: <ArrowButton left />,
    nextArrow: <ArrowButton />,
    afterChange,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count), arrows: true } },
      { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), arrows: true } },
      { breakpoint: 480,  settings: { slidesToShow: 1, arrows: true } },
    ],
  };
}

const FALLBACK_IMAGE = '/images/products/missing-image.png';
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

export default function ProductCarousel({
  products,
  title,
  showPrice = true,
  showRatings = false,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlideFocus = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.slick-slide')
      .forEach(slide => {
        const isHidden = slide.getAttribute('aria-hidden') === 'true';
        slide.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR).forEach(el => {
          if (isHidden) {
            if (!el.hasAttribute('data-orig-tabindex')) {
              const orig = el.getAttribute('tabindex');
              el.setAttribute('data-orig-tabindex', orig ?? '');
            }
            el.setAttribute('tabindex', '-1');
          } else if (el.hasAttribute('data-orig-tabindex')) {
            const orig = el.getAttribute('data-orig-tabindex') ?? '';
            if (orig === '') {
              el.removeAttribute('tabindex');
            } else {
              el.setAttribute('tabindex', orig);
            }
            el.removeAttribute('data-orig-tabindex');
          }
        });
      });
  }, []);

  // Accessibility: disable focus in hidden slides
  useEffect(() => {
    const timer = setTimeout(updateSlideFocus, 0);
    return () => clearTimeout(timer);
  }, [products, updateSlideFocus]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mb-12" ref={containerRef}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <div className="relative px-2 max-w-6xl mx-auto">
        <Slider {...getCarouselSettings(products.length, updateSlideFocus)}>
          {products.map(p => {
            const src = Array.isArray(p.images) && p.images[0]
              ? getPublicImageUrl(p.images[0])
              : getPublicImageUrl(p.image) || FALLBACK_IMAGE;

            const productId = p.id ?? p._id;
            const ratingValue = typeof p.average_rating === 'number' ? p.average_rating : 0;

            return (
              <div key={p._id} className="px-2">
                <Link
                  href={`/products/${productId}`}
                  className="block border border-gray-200 rounded-lg overflow-hidden group transition-transform duration-200 hover:scale-105 focus-visible:border-blue-500"
                  style={{ willChange: 'transform' }}
                >
                  <div
                    className="relative flex items-center justify-center bg-white"
                    style={{ width: '100%', height: '200px' }}
                  >
                    <FallbackImage
                      src={src}
                      alt={p.product_name}
                      width={160}
                      height={180}
                      className="object-contain max-h-48 mx-auto"
                    />
                  </div>
                  <div className="p-2">
                    <div
                      className="flex justify-between items-center"
                      style={{ fontSize: '1.2rem', lineHeight: '1.8rem' }}
                    >
                      <span className="font-medium truncate">
                        {p.product_name}
                      </span>
                      {showPrice && (
                        <span className="ml-2 font-semibold text-blue-700">
                          ${Number(p.price ?? 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {showRatings && ratingValue > 0 && (
                      <div className="flex items-center mt-1 text-xs text-gray-600">
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
                        <span className="ml-2">{ratingValue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}
