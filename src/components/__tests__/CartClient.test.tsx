import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import CartClient from '@/components/CartClient';

const pushMock = vi.fn();
const useStoreMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/store/useStore', () => ({
  useStore: () => useStoreMock(),
}));

beforeEach(() => {
  pushMock.mockReset();
  useStoreMock.mockReset();
});

test('shows loading state before auth hydration', () => {
  useStoreMock.mockReturnValue({
    isAuthenticated: false,
    user: null,
    authHydrated: false,
  });

  render(<CartClient />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('prompts login when unauthenticated', () => {
  useStoreMock.mockReturnValue({
    isAuthenticated: false,
    user: null,
    authHydrated: true,
  });

  render(<CartClient />);
  expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Go to Login/i }));
  expect(pushMock).toHaveBeenCalledWith('/auth/login');
});

test('greets authenticated user', () => {
  useStoreMock.mockReturnValue({
    isAuthenticated: true,
    user: { email: 'hello@example.com' },
    authHydrated: true,
  });

  render(<CartClient />);
  expect(screen.getByText(/Welcome, hello@example.com/i)).toBeInTheDocument();
});
