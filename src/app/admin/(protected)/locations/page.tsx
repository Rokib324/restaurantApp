import { getAllLocationsAdmin } from '@/lib/locations';
import AdminLocationsClient from '@/components/admin/locations/AdminLocationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminLocationsPage() {
  const initialLocations = await getAllLocationsAdmin();

  return <AdminLocationsClient initialLocations={initialLocations} />;
}
