// components/ClientLayout.tsx

"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/Header";
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
    <>
      <Header />
      {children}
    </>
  );
}
