import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalShell from '@/components/ui/ConditionalShell';
import { SiteSettingsProvider } from '@/components/providers/SiteSettingsProvider';
import { getSiteSettings } from '@/lib/siteSettings';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: `${site.name} | Fast Food Delivery in Dhaka`,
    description: site.description,
    keywords: [site.name, 'fast food delivery', 'Dhaka', 'bKash', 'Nagad', 'burger', 'pizza', 'Bangladesh'],
    applicationName: site.name,
    openGraph: {
      title: `${site.name} | Fast Food Delivery`,
      siteName: site.name,
      description: 'Order hot, fresh food delivered to your door. bKash & Nagad accepted.',
      type: 'website',
      locale: 'en_BD',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteSettings();

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased min-h-screen">
        <SiteSettingsProvider value={site}>
          <ConditionalShell>{children}</ConditionalShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
