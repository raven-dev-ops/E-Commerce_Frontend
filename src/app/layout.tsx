//  src/app/layout.tsx

import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import type { Metadata } from 'next';

/* –– fonts –– */
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

/* –– page & social metadata –– */
export const metadata: Metadata = {
  title: {
    default: 'TwiinZ Beard Balms & Essentials',
    template: '%s | TwiinZ Beard Balms & Essentials',
  },
  description:
    'TwiinZ Beard Balm & Essentials began in 2022 in our Kansas City kitchen. Founded by seeking non-oily, lightly-fragranced, affordable grooming, we now craft 7 balms, 8 oils, 6 washes and 1 wax, with more on the way. Proudly veteran-owned and operated.',
  openGraph: {
    title: 'TwiinZ Beard Balms & Essentials',
    description:
      'Hand-blended beard care from Kansas City. Balms, oils, washes and wax built for performance, not perfume.',
    images: [
      {
        url: '/images/logos/logo.png',
        width: 800,
        height: 800,
        alt: 'TwiinZ Beard Balms & Essentials logo',
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
