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

// --- Chevron Arrow Components ---
function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      aria-label="Previous"
      className={`${className} slick-arrow left-0 z-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300 hover:bg-gray-200 transition-all`}
      style={{ ...style, left: '-30px', width: 40, height: 40, display: 'flex' }}
      onClick={onClick}
      tabIndex={0}
    >
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 16l-5-5 5-5"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      aria-label="Next"
      className={`${className} slick-arrow right-0 z-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-300 hover:bg-gray-200 transition-all`}
      style={{ ...style, right: '-30px', width: 40, height: 40, display: 'flex' }}
      onClick={onClick}
      tabIndex={0}
    >
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
        <path
          d="M7 4l5 5-5 5"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

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
      { breakpoint: 600,  settings: { slidesToShow: Math.min(2, count), arrows: true } },
      { breakpoint: 480,  settings: { slidesToShow: 1, arrows: true } },
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

  const settings = {
    ...getCarouselSettings(products.length),
  };

  return (
    <section className="mb-12" ref={containerRef}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <Slider
        {...settings}
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
      >
        {products.map(p => {
          const src = Array.isArray(p.images) && p.images[0]
            ? getPublicImageUrl(p.images[0])
            : getPublicImageUrl(p.image) || FALLBACK_IMAGE;

          const productId = p.id ?? p._id;
          const ratingValue = typeof p.average_rating === 'number' ? p.average_rating : 0;

          return (
            <div key={p._id} className="px-2">
              <Link href={`/products/${productId}`}>
                <a
                  className="block border border-gray-200 rounded-lg overflow-hidden group 
                            transition-transform duration-200 hover:scale-105 focus-visible:border-blue-500"
                  style={{
                    willChange: 'transform'
                  }}
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
                      unoptimized
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
                </a>
              </Link>
            </div>
          );
        })}
      </Slider>
    </section>
  );
}
