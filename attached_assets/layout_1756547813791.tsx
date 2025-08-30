
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SOVR Pay Checkout - Blockchain Payment Processing',
  description: 'Professional blockchain-based payment processing system for online retailers using SOVR Credit settlements on Polygon.',
  keywords: ['blockchain', 'payments', 'SOVR', 'Polygon', 'cryptocurrency', 'checkout', 'fintech'],
  authors: [{ name: 'SOVR Pay Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
