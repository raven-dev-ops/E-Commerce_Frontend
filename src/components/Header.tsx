'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShoppingBag, User, X, Shirt } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import FacebookAuthButton from '@/components/FacebookAuthButton';
import InstagramAuthButton from '@/components/InstagramAuthButton';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { cart, logout } = useStore();
  const router = useRouter();

  const totalItems =
    cart?.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    ) || 0;

  const handleLogout = async () => {
    logout?.();
    await signOut({ redirect: false });
    router.push('/');
    setShowLogin(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'authenticated') {
      router.push('/cart');
    } else {
      setShowLogin(true);
    }
  };

  const handleUserClick = () => {
    setShowLogin(true);
    setIsSignUp(false);
    setFormError(null);
    setFormSuccess(null);
  };

  // Handle registration
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Account created! You may now sign in.');
        setFormError(null);
        setIsSignUp(false);
      } else {
        setFormError(data?.message || 'Sign up failed.');
      }
    } catch (err) {
      setFormError('Sign up failed.');
    }
    setLoading(false);
  };

  // Handle credentials login
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result && result.error) {
      setFormError('Invalid credentials.');
    } else {
      setShowLogin(false);
    }
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
        <nav className="container mx-auto flex justify-center">
          <div className="flex items-center justify-center gap-8 w-full max-w-4xl mx-auto">
            {/* Profile */}
            <button
              onClick={handleUserClick}
              className="flex items-center p-2 rounded focus:outline-none hover:scale-110 transition-transform"
              aria-label="Profile"
              style={{ color: 'var(--foreground)', background: 'transparent' }}
            >
              <User className="w-8 h-8" />
            </button>
            {/* Merch */}
            <Link href="/merch" aria-label="Merch">
              <Shirt
                className="w-8 h-8 hover:scale-110 transition-transform"
                style={{ color: 'var(--foreground)' }}
              />
            </Link>
            {/* Logo */}
            <Link href="/" aria-label="Home" className="flex items-center">
              <Image
                src="/images/logos/Twiin_Logo_v3.png"
                alt="Home"
                width={310}
                height={310}
                className="transition-transform duration-200 hover:scale-110"
                priority
              />
            </Link>
            {/* Products */}
            <Link href="/products" aria-label="Products">
              <ShoppingBag
                className="w-8 h-8 hover:scale-110 transition-transform"
                style={{ color: 'var(--foreground)' }}
              />
            </Link>
            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative flex items-center p-2 rounded focus:outline-none hover:scale-110 transition-transform"
              aria-label="Cart"
              style={{ color: 'var(--foreground)', background: 'transparent' }}
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

      {/* Modal for Login/Profile/Sign Up */}
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
                <h2 className="text-2xl font-bold mb-4 text-center">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </h2>
                {formError && (
                  <div className="mb-3 text-center text-red-600 font-semibold">{formError}</div>
                )}
                {formSuccess && (
                  <div className="mb-3 text-center text-green-600 font-semibold">{formSuccess}</div>
                )}
                {/* Sign Up form */}
                {isSignUp ? (
                  <form 
                    onSubmit={handleSignUp}
                    className="flex flex-col space-y-4"
                  >
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      className="border p-3 rounded"
                      required
                      disabled={loading}
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      className="border p-3 rounded"
                      required
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      {loading ? 'Signing up...' : 'Sign Up with Email'}
                    </button>
                    <button
                      type="button"
                      className="w-full text-blue-600 font-semibold hover:underline transition"
                      onClick={() => { setIsSignUp(false); setFormError(null); setFormSuccess(null); }}
                      disabled={loading}
                    >
                      Already have an account? Sign In
                    </button>
                  </form>
                ) : (
                  <>
                    {/* Credentials (Email/Password) login */}
                    <form
                      onSubmit={handleSignIn}
                      className="flex flex-col space-y-4"
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="border p-3 rounded"
                        required
                        disabled={loading}
                      />
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="border p-3 rounded"
                        required
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Log In with Email'}
                      </button>
                      <button
                        type="button"
                        className="w-full text-green-600 font-semibold hover:underline transition"
                        onClick={() => { setIsSignUp(true); setFormError(null); setFormSuccess(null); }}
                        disabled={loading}
                      >
                        New here? Sign Up
                      </button>
                    </form>
                  </>
                )}
                <div className="my-6 flex items-center justify-center">
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                  <span className="text-xs text-gray-500 uppercase px-2">or</span>
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                </div>
                <GoogleAuthButton />
                <FacebookAuthButton />
                <InstagramAuthButton />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
