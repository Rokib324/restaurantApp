import { getSiteSettings } from '@/lib/siteSettings';
import BrandSettingsForm from '@/components/admin/BrandSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <BrandSettingsForm initial={settings} />;
}
