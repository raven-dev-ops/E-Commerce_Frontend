'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShoppingBag, User, X, Shirt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import GoogleAuthButton from '@/components/GoogleAuthButton';

import { loginWithEmailPassword, loginWithGoogle, registerWithEmailPassword } from '@/lib/auth';

const Header: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const { cart, login, logout, user, isAuthenticated } = useStore();
  const router = useRouter();

  const totalItems =
    cart?.reduce(
      (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
      0
    ) || 0;

  const userEmail = user?.email ?? user?.username ?? null;

  const handleLogout = () => {
    logout();
    setShowLogin(false);
    router.push('/');
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
    setIsSignUp(false);
    setFormError(null);
    setFormSuccess(null);
  };

  useEffect(() => {
    if (!showLogin) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const modal = modalRef.current;
      if (!modal) return [];
      return Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('aria-hidden'));
    };

    const focusFirst = () => {
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalRef.current?.focus();
      }
    };

    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowLogin(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !modalRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
  }, [showLogin]);

  // Handle registration (dj-rest-auth preferred)
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await registerWithEmailPassword(email, password);
      setFormSuccess('Account created! Check your email to verify, then sign in.');
      setFormError(null);
      setIsSignUp(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed.';
      setFormError(message);
    }
    setLoading(false);
  };

  // Handle credentials login (dj-rest-auth preferred)
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const session = await loginWithEmailPassword(email, password);
      login(session);
      setShowLogin(false);
      setFormError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setFormError(message);
    }
    setLoading(false);
  };

  // GOOGLE HANDLER for SPA login flow
  const handleGoogleSuccess = async (code: string) => {
    setLoading(true);
    setFormError(null);
    try {
      const session = await loginWithGoogle(code);
      login(session);
      setShowLogin(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    setFormError(error || 'Google login failed.');
  };

  const describedBy = [formError ? 'auth-form-error' : null, formSuccess ? 'auth-form-success' : null]
    .filter(Boolean)
    .join(' ') || undefined;

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
            <Link href="/merch" aria-label="Merch" prefetch={false}>
              <Shirt
                className="w-8 h-8 hover:scale-110 transition-transform"
                style={{ color: 'var(--foreground)' }}
              />
            </Link>
            {/* Logo */}
            <Link href="/" aria-label="Home" className="flex items-center" prefetch={false}>
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
            <Link href="/products" aria-label="Products" prefetch={false}>
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
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            tabIndex={-1}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8"
          >
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
                <div className="text-xl font-semibold mb-2">{userEmail}</div>
                <Link className="text-blue-600 underline mb-4" href="/orders">My Orders</Link>
                <Link className="text-blue-600 underline mb-4" href="/addresses">My Addresses</Link>
                <Link className="text-blue-600 underline mb-4" href="/profile">Profile</Link>
                <button
                  className="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <h2 id="auth-modal-title" className="text-2xl font-bold mb-4 text-center">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </h2>
                {formError && (
                  <div
                    id="auth-form-error"
                    role="alert"
                    aria-live="assertive"
                    className="mb-3 text-center text-red-600 font-semibold"
                  >
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div
                    id="auth-form-success"
                    role="status"
                    aria-live="polite"
                    className="mb-3 text-center text-green-600 font-semibold"
                  >
                    {formSuccess}
                  </div>
                )}
                {isSignUp ? (
                  <form
                    onSubmit={handleSignUp}
                    className="flex flex-col space-y-4"
                    aria-describedby={describedBy}
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
                    <form
                      onSubmit={handleSignIn}
                      className="flex flex-col space-y-4"
                      aria-describedby={describedBy}
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
                <GoogleAuthButton
                  text="Continue with Google"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
