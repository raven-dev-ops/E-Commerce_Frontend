// components/Header.tsx

'use client';

import Link from 'next/link';
import React from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation'; // For Next.js App Router

const Header: React.FC = () => {
  const { cart, isAuthenticated, user, logout } = useStore();
  const router = useRouter();

  const totalItems = cart?.reduce(
    (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
    0
  ) || 0;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      logout(); // From Zustand store
      router.push('/');
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
          {isAuthenticated ? (
            <>
              {user?.email && <span>Welcome, {user.email}</span>}
              <button onClick={handleLogout} className="cursor-pointer">
                Logout
              </button>
              <Link href="/cart">Cart ({totalItems})</Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
              <Link href="/cart">Cart ({totalItems})</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
