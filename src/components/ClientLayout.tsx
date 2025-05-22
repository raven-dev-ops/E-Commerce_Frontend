"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { useStore } from '@/store/useStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null); // Use a more specific type if available
  const hydrateCart = useStore(state => state.hydrateCart);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cart hydration logic
      hydrateCart();

      // Authentication logic
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
        // If you store user info alongside the token, parse and set it here
        // Example: const userData = localStorage.getItem('userInfo');
        // if (userData) setUserInfo(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    }
  }, [hydrateCart]); // Include hydrateCart in dependencies if it's part of component scope

  return (
    <>
      <Header />
      {children}
    </>
  );
}