import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FoodieExpress BD | Fast Food Delivery in Dhaka',
  description:
    'Order delicious burgers, pizza, wraps and more from FoodieExpress — Dhaka\'s premier fast food delivery. Pay via bKash, Nagad, or Cash on Delivery.',
  keywords: ['fast food delivery', 'Dhaka', 'bKash', 'Nagad', 'burger', 'pizza', 'Bangladesh'],
  openGraph: {
    title: 'FoodieExpress BD | Fast Food Delivery',
    description: 'Order hot, fresh food delivered to your door. bKash & Nagad accepted.',
    type: 'website',
    locale: 'en_BD',
  },
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-white/10 py-10 mt-20">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} FoodieExpress Bangladesh. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              📍 Dhaka, Bangladesh &nbsp;|&nbsp; 🍔 Fast Food Delivered Fresh
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
