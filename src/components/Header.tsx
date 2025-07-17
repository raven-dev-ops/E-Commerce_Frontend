'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShoppingBag, User, X } from 'lucide-react';

const Header: React.FC = () => {
  const { cart, isAuthenticated, user, logout } = useStore();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const totalItems =
    cart?.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    ) || 0;

  const handleLogout = () => {
    logout();
    router.push('/');
    setShowLogin(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/cart');
    } else {
      setShowLogin(true);
    }
  };

  const handleUserClick = () => {
    setShowLogin(true);
  };

  return (
    <>
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
            <Link href="/products" aria-label="Products">
              <ShoppingBag
                className="w-8 h-8 hover:scale-110 transition-transform"
                style={{ color: 'var(--foreground)' }}
              />
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={handleUserClick}
              className="relative flex items-center p-3 rounded hover:bg-gray-200 focus:outline-none"
              aria-label="User"
              style={{ color: 'var(--foreground)' }}
            >
              <User className="w-8 h-8" />
            </button>
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

      {/* Modal Login/Profile */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>
            {isAuthenticated ? (
              <div className="flex flex-col items-center">
                <User className="w-16 h-16 mb-4 text-gray-700" />
                <div className="text-xl font-semibold mb-2">
                  {user?.email}
                </div>
                <button
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                {/* Replace below with your login form */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    // add your login handler
                    setShowLogin(false);
                  }}
                  className="flex flex-col space-y-4"
                >
                  <input
                    type="email"
                    placeholder="Email"
                    className="border p-3 rounded"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="border p-3 rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                  >
                    Log In
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
