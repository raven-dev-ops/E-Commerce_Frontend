'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShoppingBag, User, X } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';

const Header: React.FC = () => {
  // NextAuth session (provides session.user, session.access, etc.)
  const { data: session, status } = useSession();
  // Local state for modal display
  const [showLogin, setShowLogin] = useState(false);

  // Your custom store for cart, logout, etc.
  const { cart, logout } = useStore();
  const router = useRouter();

  // Calculate total items in cart
  const totalItems =
    cart?.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    ) || 0;

  // Logout logic for both store and NextAuth
  const handleLogout = async () => {
    logout?.();
    await signOut({ redirect: false });
    router.push('/');
    setShowLogin(false);
  };

  // When cart clicked
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'authenticated') {
      router.push('/cart');
    } else {
      setShowLogin(true);
    }
  };

  // When user icon clicked
  const handleUserClick = () => {
    setShowLogin(true);
  };

  // Render
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

      {/* Modal for Login/Profile */}
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
            {status === 'authenticated' ? (
              <div className="flex flex-col items-center">
                <User className="w-16 h-16 mb-4 text-gray-700" />
                <div className="text-xl font-semibold mb-2">
                  {session?.user?.email}
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
                <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
                {/* You can remove this form if you only want Google login */}
                {/* <form
                  onSubmit={e => {
                    e.preventDefault();
                    // Custom auth logic here if needed
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
                <div className="my-6 flex items-center justify-center">
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                  <span className="text-xs text-gray-500 uppercase px-2">
                    or
                  </span>
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                </div> */}
                {/* Google Login Button */}
                <button
                  onClick={() => signIn('google')}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded bg-white hover:bg-gray-50 transition font-semibold text-gray-700 shadow-sm"
                >
                  <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <g>
                      <path
                        d="M44.5 20H24v8.5h11.7C34.3 32.3 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.2l6.4-6.4C34.5 5.8 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"
                        fill="#FFC107"
                      />
                      <path
                        d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.6 0 5 .8 7 2.2l6.4-6.4C34.5 5.8 29.5 4 24 4c-7.3 0-13.6 4-17.2 10.7z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M24 44c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.8 35.6 27 36.5 24 36.5c-5.6 0-10.2-3.8-11.8-8.9l-7 5.4C7.9 40.1 15.5 44 24 44z"
                        fill="#4CAF50"
                      />
                      <path
                        d="M44.5 20H24v8.5h11.7c-1.3 3.4-4.3 5.5-7.7 5.5-2.3 0-4.4-.7-6.2-2.1l-7 5.4C17.6 41.6 20.6 44 24 44c7.3 0 13.6-4 17.2-10.7z"
                        fill="#1976D2"
                      />
                    </g>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
