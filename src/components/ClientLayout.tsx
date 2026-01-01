"use client";

import { useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useStore, StoreState } from '@/store/useStore';
import { requirePublicEnv } from '@/lib/env';
import { onAuthChange } from '@/lib/authStorage';

const GOOGLE_CLIENT_ID = requirePublicEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID');

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrateCart = useStore((state: StoreState) => state.hydrateCart);
  const hydrateAuth = useStore((state: StoreState) => state.hydrateAuth);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    hydrateCart();
    hydrateAuth();
    const unsubscribe = onAuthChange(() => hydrateAuth());
    return () => unsubscribe();
  }, [hydrateCart, hydrateAuth]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex flex-grow flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
