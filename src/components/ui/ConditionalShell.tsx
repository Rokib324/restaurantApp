'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}
