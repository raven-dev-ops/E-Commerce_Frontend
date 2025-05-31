// components/RootLayout.tsx

import React from 'react';
import { Metadata } from '../types/metadata';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from './ClientLayout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  metadata: Metadata;
  children: React.ReactNode; // Ensure children prop is defined here
}

const RootLayout: React.FC<RootLayoutProps> = ({ metadata, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>
          {children} {/* Render children within ClientLayout */}
        </ClientLayout>
      </body>
    </html>
  );
};

export default RootLayout;
