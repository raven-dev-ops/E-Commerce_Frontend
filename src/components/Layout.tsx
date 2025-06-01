// src/components/Layout.tsx

import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <footer className="h-16 flex items-center justify-center bg-gray-800 text-white">
      <div className="w-full text-center">
        <p>
          &copy; {new Date().getFullYear()} TwiinZ Beard Balm & Essentials. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
);

export default Layout;
