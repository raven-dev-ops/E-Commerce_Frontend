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
      className="py-6 px-6"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        borderBottom: '1.5px solid var(--dark-grey)',
      }}
    >
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center" aria-label="Home">
            <Image
              src="/images/logos/logo.png"
              alt="Home"
              width={120}
              height={120}
              className="transition-transform duration-200 hover:scale-110"
              priority
            />
          </Link>
          <Link
            href="/products"
            className="font-semibold text-lg hover:underline"
            style={{ color: 'var(--foreground)' }}
          >
            Products
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          {isAuthenticated && (
            <>
              <span className="text-xl font-medium">
                Welcome, {user?.email ? user.email : 'User'}!
              </span>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 rounded text-lg hover:bg-gray-200 transition"
                style={{ color: 'var(--foreground)' }}
              >
                Logout
              </button>
            </>
          )}
          <button
            onClick={handleCartClick}
            className="relative flex items-center p-3 rounded hover:bg-gray-200 focus:outline-none"
            aria-label="Cart"
            style={{ color: 'var(--foreground)' }}
          >
            <ShoppingCart className="w-9 h-9" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-base text-white rounded-full w-7 h-7 flex items-center justify-center">
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
