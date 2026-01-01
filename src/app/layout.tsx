//  src/app/layout.tsx

import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import { getOptionalPublicEnv } from '@/lib/env';
import type { Metadata } from 'next';

/* -- fonts -- */
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const siteUrl = getOptionalPublicEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');

/* -- page & social metadata -- */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Art Bay',
    template: '%s | Art Bay',
  },
  description:
    'Art Bay is a curated marketplace for collectors discovering new paintings, photography, ceramics, and design objects from independent artists around the world.',
  openGraph: {
    title: 'Art Bay',
    description:
      'Discover limited runs and originals from emerging artists across mediums, curated by the Art Bay collective.',
    images: [
      {
        url: '/images/logos/logo.png',
        width: 800,
        height: 800,
        alt: 'Art Bay logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/logos/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {/* all site-wide providers / wrappers live here */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
