import type { Metadata } from 'next';
import LocationsSection from '@/components/locations/LocationsSection';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/siteSettings';
import { getActiveLocations } from '@/lib/locations';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: `Our Restaurant Locations in Dhaka | ${site.name}`,
    description: `Find ${site.name} restaurant locations across Dhaka. Dine-in, takeaway, and 24/7 delivery.`,
  };
}

export default async function LocationsPage() {
  const initialLocations = await getActiveLocations();

  return (
    <div className="pt-24 min-h-screen bg-gray-950">
      <div className="container mx-auto px-6 lg:px-12 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-orange-400">Locations</span>
        </div>
      </div>

      <LocationsSection initialLocations={initialLocations} />
    </div>
  );
}
