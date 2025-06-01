// components/Header.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      router.push('/auth/login');
    }
  };

  return (
    <header
      className="p-4"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        borderBottom: '1px solid var(--dark-grey)',
      }}
    >
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/images/logos/logo.png"
              alt="Home"
              width={40}
              height={40}
              className="transition-transform duration-200 hover:scale-110"
              priority
            />
          </Link>
          <Link
            href="/products"
            className="font-semibold hover:underline"
            style={{ color: 'var(--foreground)' }}
          >
            Products
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <span>
                Welcome, {user?.email ? user.email : 'User'}!
              </span>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-200 transition"
                style={{ color: 'var(--foreground)' }}
              >
                Logout
              </button>
            </>
          )}
          <button
            onClick={handleCartClick}
            className="relative flex items-center p-2 rounded hover:bg-gray-200 focus:outline-none"
            aria-label="Cart"
            style={{ color: 'var(--foreground)' }}
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
