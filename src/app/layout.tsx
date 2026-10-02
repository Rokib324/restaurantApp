import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalShell from '@/components/ui/ConditionalShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: 'FoodieExpress BD | Fast Food Delivery in Dhaka',
  description:
    "Order delicious burgers, pizza, wraps and more from FoodieExpress — Dhaka's premier fast food delivery. Pay via bKash, Nagad, or Cash on Delivery.",
  keywords: ['fast food delivery', 'Dhaka', 'bKash', 'Nagad', 'burger', 'pizza', 'Bangladesh'],
  openGraph: {
    title: 'FoodieExpress BD | Fast Food Delivery',
    description: 'Order hot, fresh food delivered to your door. bKash & Nagad accepted.',
    type: 'website',
    locale: 'en_BD',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased min-h-screen">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
