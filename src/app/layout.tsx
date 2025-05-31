import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
 variable: "--font-geist-sans",
  subsets: ["latin"],
});

 const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TwiinZ Beard Balms & Essentials",
  description: "TwiinZ Beard Balm & Essentials began in 2022 in our Kansas City kitchen. Founded by veterans seeking non-oily, lightly fragranced, and affordable grooming products, we started with a simple idea and a sketch. Today, we offer a range of 7 balms, 8 oils, 6 washes, and 1 wax, with ongoing innovations and merchandise in the pipeline. Proudly veteran-owned and operated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
 <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
