import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import { LOCATIONS_CACHE_TAG, seedDefaultLocationsIfNeeded } from '@/lib/locations';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    await seedDefaultLocationsIfNeeded();

    const locations = await Location.find({}).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    console.error('Admin GET /locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const {
      name,
      area,
      address,
      phone,
      hours,
      coordinates,
      isOpenNow,
      is24HoursDelivery,
      features,
      rating,
      reviewsCount,
      googleMapsUrl,
      popularDish,
      order,
      isActive,
    } = body;

    if (!name || !area || !address || !phone) {
      return NextResponse.json(
        { success: false, error: 'Branch name, area, address, and phone number are required.' },
        { status: 400 }
      );
    }

    // Coordinates validation
    let coords: [number, number] = [23.8103, 90.4125]; // Default Dhaka center
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const lat = parseFloat(coordinates[0]);
      const lng = parseFloat(coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coords = [lat, lng];
      }
    }

    // Unique slug
    let slug = slugify(`${area}-${name}`);
    if (!slug) slug = `branch-${Date.now()}`;
    const existing = await Location.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const calculatedMapsUrl =
      googleMapsUrl && googleMapsUrl.trim()
        ? googleMapsUrl.trim()
        : `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

    const newLocation = await Location.create({
      name: name.trim(),
      slug,
      area: area.trim(),
      address: address.trim(),
      phone: phone.trim(),
      hours: hours?.trim() || '10:00 AM – 11:00 PM',
      coordinates: coords,
      isOpenNow: isOpenNow !== false,
      is24HoursDelivery: !!is24HoursDelivery,
      features: Array.isArray(features)
        ? features
        : typeof features === 'string'
        ? features.split(',').map((f) => f.trim()).filter(Boolean)
        : ['Dine-in', 'Takeaway', 'Delivery'],
      rating: !isNaN(Number(rating)) ? Math.min(5, Math.max(1, Number(rating))) : 4.8,
      reviewsCount: !isNaN(Number(reviewsCount)) ? Math.max(0, Number(reviewsCount)) : 50,
      googleMapsUrl: calculatedMapsUrl,
      popularDish: popularDish?.trim() || '',
      order: !isNaN(Number(order)) ? Number(order) : 0,
      isActive: isActive !== false,
    });

    revalidateTag(LOCATIONS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: newLocation }, { status: 201 });
  } catch (error) {
    console.error('Admin POST /locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { id, locationId, ...updates } = body;
    const targetId = id || locationId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Location ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.area !== undefined) updateData.area = updates.area.trim();
    if (updates.address !== undefined) updateData.address = updates.address.trim();
    if (updates.phone !== undefined) updateData.phone = updates.phone.trim();
    if (updates.hours !== undefined) updateData.hours = updates.hours.trim();
    if (updates.isOpenNow !== undefined) updateData.isOpenNow = !!updates.isOpenNow;
    if (updates.is24HoursDelivery !== undefined) updateData.is24HoursDelivery = !!updates.is24HoursDelivery;
    if (updates.isActive !== undefined) updateData.isActive = !!updates.isActive;
    if (updates.popularDish !== undefined) updateData.popularDish = updates.popularDish.trim();
    if (updates.order !== undefined) updateData.order = Number(updates.order) || 0;
    if (updates.rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Number(updates.rating)));
    if (updates.reviewsCount !== undefined) updateData.reviewsCount = Math.max(0, Number(updates.reviewsCount));

    if (updates.features !== undefined) {
      updateData.features = Array.isArray(updates.features)
        ? updates.features
        : typeof updates.features === 'string'
        ? updates.features.split(',').map((f: string) => f.trim()).filter(Boolean)
        : [];
    }

    if (Array.isArray(updates.coordinates) && updates.coordinates.length === 2) {
      const lat = parseFloat(updates.coordinates[0]);
      const lng = parseFloat(updates.coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        updateData.coordinates = [lat, lng];
        if (!updates.googleMapsUrl) {
          updateData.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
      }
    }

    if (updates.googleMapsUrl !== undefined) {
      updateData.googleMapsUrl = updates.googleMapsUrl.trim();
    }

    const updated = await Location.findByIdAndUpdate(targetId, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    revalidateTag(LOCATIONS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin PATCH /locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Location ID is required' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    revalidateTag(LOCATIONS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Admin DELETE /locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
