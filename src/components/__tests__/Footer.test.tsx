import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import Footer from '@/components/Footer';

test('renders footer links', () => {
  render(<Footer />);
  expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
  expect(screen.getByText(/Refund Policy/i)).toBeInTheDocument();
  expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
});
