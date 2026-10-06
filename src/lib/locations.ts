import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import { RESTAURANT_LOCATIONS, RestaurantLocation } from '@/data/locations';

export const LOCATIONS_CACHE_TAG = 'locations-list';

/**
 * Ensures existing static locations are seeded into the database on first run.
 */
export async function seedDefaultLocationsIfNeeded() {
  try {
    await dbConnect();
    const count = await Location.countDocuments();
    if (count === 0) {
      const docs = RESTAURANT_LOCATIONS.map((loc, index) => ({
        name: loc.name,
        slug: loc.slug || loc.id,
        area: loc.area,
        address: loc.address,
        coordinates: loc.coordinates,
        phone: loc.phone,
        hours: loc.hours,
        isOpenNow: loc.isOpenNow !== false,
        is24HoursDelivery: !!loc.is24HoursDelivery,
        features: loc.features || ['Dine-in', 'Takeaway', 'Delivery'],
        rating: loc.rating || 4.8,
        reviewsCount: loc.reviewsCount || 100,
        googleMapsUrl: loc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${loc.coordinates[0]},${loc.coordinates[1]}`,
        popularDish: loc.popularDish || '',
        order: index + 1,
        isActive: true,
      }));
      await Location.insertMany(docs);
      console.log('Successfully seeded default restaurant locations into MongoDB');
    }
  } catch (error) {
    console.error('Error seeding default locations:', error);
  }
}

/**
 * Fetches all active locations from MongoDB, cached for high performance.
 */
export const getActiveLocations = unstable_cache(
  async (): Promise<RestaurantLocation[]> => {
    try {
      await dbConnect();
      await seedDefaultLocationsIfNeeded();

      const docs = await Location.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();

      if (!docs || docs.length === 0) {
        return RESTAURANT_LOCATIONS;
      }

      return docs.map((d) => {
        const doc = d as unknown as Record<string, unknown>;
        const coords = (doc.coordinates as number[]) || [23.8103, 90.4125];
        return {
          id: String(doc._id),
          name: String(doc.name || ''),
          slug: String(doc.slug || ''),
          area: String(doc.area || ''),
          address: String(doc.address || ''),
          coordinates: [Number(coords[0]), Number(coords[1])] as [number, number],
          phone: String(doc.phone || ''),
          hours: String(doc.hours || ''),
          isOpenNow: doc.isOpenNow !== false,
          is24HoursDelivery: !!doc.is24HoursDelivery,
          features: Array.isArray(doc.features) ? (doc.features as string[]) : [],
          rating: Number(doc.rating) || 4.8,
          reviewsCount: Number(doc.reviewsCount) || 100,
          googleMapsUrl:
            (doc.googleMapsUrl as string) ||
            `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`,
          popularDish: String(doc.popularDish || ''),
          order: Number(doc.order) || 0,
          isActive: doc.isActive !== false,
        };
      });
    } catch (error) {
      console.error('getActiveLocations error:', error);
      return RESTAURANT_LOCATIONS;
    }
  },
  [LOCATIONS_CACHE_TAG],
  { tags: [LOCATIONS_CACHE_TAG], revalidate: 3600 }
);
