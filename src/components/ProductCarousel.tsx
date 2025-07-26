'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import FallbackImage from '@/components/FallbackImage';
import Link from 'next/link';
import type { Product } from '@/types/product';

const FALLBACK_IMAGE = '/images/products/missing-image.png';

const getPublicImageUrl = (input?: string): string | undefined => {
  if (!input) return undefined;
  if (/^https?:\/\//.test(input)) return input;
  if (input.startsWith('/images/')) return input;
  if (input.startsWith('images/')) return `/${input}`;
  return `/images/products/${input}`;
};

const carouselSettings = (count: number) => ({
  dots: false,
  arrows: true,
  infinite: count > 4,
  speed: 500,
  slidesToShow: Math.min(4, count),
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: Math.min(3, count) } },
    { breakpoint: 600, settings: { slidesToShow: Math.min(2, count) } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
});

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showPrice?: boolean;
  showRatings?: boolean;
}

function renderStars(rating = 0) {
  const rounded = Math.round(Number(rating) * 2) / 2;
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          className={`w-4 h-4 ${i + 1 <= rounded ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <title>{i + 1 <= rounded ? 'Full Star' : 'Empty Star'}</title>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.186a1 1 0 00.95.69h4.401c.969 0 1.371 1.24.588 1.81l-3.565 2.59a1 1 0 00-.364 1.118l1.357 4.186c.3.921-.755 1.688-1.54 1.118l-3.565-2.59a1 1 0 00-1.175 0l-3.565 2.59c-.784.57-1.838-.197-1.54-1.118l1.357-4.186a1 1 0 00-.364-1.118l-3.565-2.59c-.784-.57-.38-1.81.588-1.81h4.401a1 1 0 00.95-.69l1.357-4.186z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCarousel({
  products,
  title,
  showPrice = true,
  showRatings = false,
}: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <Slider {...carouselSettings(products.length)}>
        {products.map((item) => {
          const src =
            Array.isArray(item.images) && item.images[0]
              ? getPublicImageUrl(item.images[0])
              : getPublicImageUrl(item.image) || FALLBACK_IMAGE;

          return (
            <div key={item._id} className="px-2">
              <div className="min-w-[200px] bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition">
                <Link href={`/products/${item._id}`} className="block w-full">
                  <FallbackImage
                    src={src}
                    alt={item.product_name || 'Product'}
                    width={120}
                    height={150}
                    className="object-contain mb-2 mx-auto"
                    unoptimized
                  />
                  <div className="font-semibold text-center line-clamp-2">
                    {item.product_name}
                  </div>
                  {showPrice && (
                    <div className="text-gray-500 mb-1">
                      ${Number(item.price ?? 0).toFixed(2)}
                    </div>
                  )}
                  {showRatings && item.average_rating != null && (
                    <div className="flex justify-center mt-1">
                      {renderStars(item.average_rating)}
                      <span className="ml-1 text-xs text-gray-500">
                        {Number(item.average_rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
