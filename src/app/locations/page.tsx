import type { Metadata } from 'next';
import LocationsSection from '@/components/locations/LocationsSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Restaurant Locations in Dhaka | FoodieExpress BD',
  description:
    'Find FoodieExpress restaurant locations across Dhaka: Gulshan, Dhanmondi, Banani, Uttara, and Mirpur. Dine-in, takeaway, and 24/7 delivery.',
};

export default function LocationsPage() {
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

      <LocationsSection />
    </div>
  );
}
