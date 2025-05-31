// src/components/Layout.tsx

import React, { ReactNode } from 'react';
import Header from './Header'; // Adjust the path as per your actual header component location

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header section (if applicable) */}
      <Header />

      {/* Main content section */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer section (if applicable) */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
