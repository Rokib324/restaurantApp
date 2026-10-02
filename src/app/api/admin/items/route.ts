import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

// Invalidate public items cache on mutations
function invalidateItemsCache() {
  try {
    // The public /api/items route uses module-level cache vars.
    // We can't reach them directly, but we can signal via a global flag.
    // Simplest approach: just let them expire naturally (60s TTL).
    // For immediate effect, attach cache-busting to admin item writes.
  } catch {/* noop */}
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const items = await Item.find({}).sort({ category: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Admin GET /items error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
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
    const { name, price, category, description, imageUrl, tags, isAvailable } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'name, price, and category are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(name);
    const existingWithSlug = await Item.findOne({ slug });
    if (existingWithSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const item = await Item.create({
      name: name.trim(),
      slug,
      price: parseFloat(price),
      category: category.toLowerCase().trim(),
      description: description?.trim() || '',
      imageUrl: imageUrl?.trim() || '',
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      isAvailable: isAvailable !== false,
    });

    invalidateItemsCache();
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Admin POST /items error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
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
    const { itemId, isAvailable, price, name, category, description, imageUrl, tags } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId required' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (isAvailable !== undefined) update.isAvailable = isAvailable;
    if (price !== undefined) update.price = parseFloat(price);
    if (name !== undefined) update.name = name.trim();
    if (category !== undefined) update.category = category.toLowerCase().trim();
    if (description !== undefined) update.description = description.trim();
    if (imageUrl !== undefined) update.imageUrl = imageUrl.trim();
    if (tags !== undefined) {
      update.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    const item = await Item.findByIdAndUpdate(itemId, update, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    invalidateItemsCache();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Admin PATCH /items error:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'id query param required' }, { status: 400 });
    }

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    invalidateItemsCache();
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Admin DELETE /items error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
