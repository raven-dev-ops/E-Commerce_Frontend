// src/components/Layout.tsx

import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content section */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer section (if applicable) */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} TwiinZ Beard Balm & Essentials. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
