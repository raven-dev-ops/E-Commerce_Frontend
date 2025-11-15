// src/components/Footer.tsx

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer
    className="h-auto py-6 px-4 flex flex-col items-center justify-center mt-auto"
    style={{
      background: 'var(--background)',
      color: 'var(--foreground)',
      borderTop: '1.5px solid var(--dark-grey)',
    }}
  >
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 text-base font-normal">
      <Link prefetch={false} href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 transition" style={{ color: 'var(--foreground)' }}>
        Privacy Policy
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link prefetch={false} href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 transition" style={{ color: 'var(--foreground)' }}>
        Terms of Service
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link prefetch={false} href="/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 transition" style={{ color: 'var(--foreground)' }}>
        Refund Policy
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link prefetch={false} href="/contact" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 transition" style={{ color: 'var(--foreground)' }}>
        Contact Us
      </Link>
    </div>
    <div className="w-full text-center mt-2 text-xs" style={{ color: 'var(--foreground)' }}>
      &copy; {new Date().getFullYear()} TwiinZ Beard Balm &amp; Essentials. All rights reserved.
    </div>
  </footer>
);

export default Footer;
