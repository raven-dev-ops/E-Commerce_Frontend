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
      <Link href="/privacy-policy" passHref>
        <a
          className="hover:underline hover:text-blue-600 transition"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--foreground)' }}
        >
          Privacy Policy
        </a>
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link href="/terms-of-service" passHref>
        <a
          className="hover:underline hover:text-blue-600 transition"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--foreground)' }}
        >
          Terms of Service
        </a>
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link href="/refund-policy" passHref>
        <a
          className="hover:underline hover:text-blue-600 transition"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--foreground)' }}
        >
          Refund Policy
        </a>
      </Link>
      <span className="hidden md:inline text-gray-400">|</span>
      <Link href="/contact" passHref>
        <a
          className="hover:underline hover:text-blue-600 transition"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--foreground)' }}
        >
          Contact Us
        </a>
      </Link>
    </div>
    <div className="w-full text-center mt-2 text-xs" style={{ color: 'var(--foreground)' }}>
      &copy; {new Date().getFullYear()} TwiinZ Beard Balm &amp; Essentials. All rights reserved.
    </div>
  </footer>
);

export default Footer;
