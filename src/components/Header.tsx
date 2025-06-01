// components/Header.tsx

'use client';

import Link from 'next/link';
import React from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

const Header: React.FC = () => {
  const { cart, isAuthenticated, user, logout } = useStore();
  const router = useRouter();

  const totalItems =
    cart?.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    ) || 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/cart');
    } else {
      router.push('/auth/login'); // Google Auth here
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <span>
                Welcome, {user?.email ? user.email : 'User'}!
              </span>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </>
          )}
          <button
            onClick={handleCartClick}
            className="relative flex items-center p-2 rounded hover:bg-gray-700 focus:outline-none"
            aria-label="Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
