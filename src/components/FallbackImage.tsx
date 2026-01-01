// src/components/FallbackImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK = '/images/products/missing-image.png';

export default function FallbackImage(
  props: Omit<ImageProps, 'src'> & { src?: string }
) {
  const { unoptimized, alt, ...rest } = props;
  const resolvedAlt = alt ?? '';
  const [src, setSrc] = useState(rest.src || FALLBACK);
  return (
    <Image
      {...rest}
      src={src}
      alt={resolvedAlt}
      onError={() => setSrc(FALLBACK)}
      unoptimized={unoptimized}
    />
  );
}
