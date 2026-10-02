import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/adminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNotificationManager from '@/components/admin/AdminNotificationManager';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <AdminNotificationManager />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
