// src/components/Layout.tsx

import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (fixed height) */}
      <header className="h-16 flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-lg font-bold">Your Header</h1>
      </header>

      {/* Main content expands to fill space between header/footer */}
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      {/* Footer (fixed height) */}
      <footer className="h-16 flex items-center justify-center bg-gray-800 text-white">
        <div className="w-full text-center">
          <p>
            &copy; {new Date().getFullYear()} TwiinZ Beard Balm & Essentials. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
