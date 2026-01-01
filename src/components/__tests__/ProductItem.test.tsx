import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import ProductItem from '@/components/ProductItem';
import type { Product } from '@/types/product';

type NextImageProps = ComponentProps<'img'> & { fill?: boolean };

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: NextImageProps) => {
    void fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ''} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

test('renders product card details', () => {
  const product: Product = {
    _id: 'p001',
    product_name: 'Classic Beard Balm',
    category: 'balms',
    description: 'A light, non-greasy balm for daily conditioning.',
    price: 14.99,
    ingredients: [],
    benefits: [],
    availability: true,
    inventory: 10,
    reserved_inventory: 0,
    images: ['/images/products/balm_classic.png'],
  };

  render(<ProductItem product={product} />);

  expect(screen.getByText(/Classic Beard Balm/i)).toBeInTheDocument();
  expect(screen.getByText('$14.99')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/products/p001');
  expect(screen.getByRole('img', { name: /Classic Beard Balm/i })).toHaveAttribute(
    'src',
    '/images/products/balm_classic.png'
  );
});
