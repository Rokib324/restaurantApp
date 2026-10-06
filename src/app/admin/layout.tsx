import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return { title: `Admin Panel — ${site.name}` };
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
