// src/components/FallbackImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK = '/images/products/missing-image.png';

export default function FallbackImage(props: Omit<ImageProps, 'src'> & { src?: string }) {
  const [src, setSrc] = useState(props.src || FALLBACK);
  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc(FALLBACK)}
      // if you really want the raw fallback behavior, you can disable optimization:
      unoptimized
    />
  );
}
