// components/ClientLayout.tsx

"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Import the Footer component
import { SessionProvider } from 'next-auth/react';
import { useStore, StoreState } from '@/store/useStore'; // Import StoreState

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const hydrateCart = useStore((state: StoreState) => state.hydrateCart);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      hydrateCart();
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    }
  }, [hydrateCart]);

  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen"> {/* Added flex column to the root div */}
        <Header />
        {/* Main content area that takes remaining space and centers content */}
        <main className="flex flex-grow items-center justify-center">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
