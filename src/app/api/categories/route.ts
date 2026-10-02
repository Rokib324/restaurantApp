import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

const DEFAULT_CATEGORIES = [
  { name: 'Burgers', slug: 'burgers', emoji: '🍔', order: 1 },
  { name: 'Pizza', slug: 'pizza', emoji: '🍕', order: 2 },
  { name: 'Wraps', slug: 'wraps', emoji: '🌯', order: 3 },
  { name: 'Sides', slug: 'sides', emoji: '🍟', order: 4 },
  { name: 'Drinks', slug: 'drinks', emoji: '🥤', order: 5 },
  { name: 'Desserts', slug: 'desserts', emoji: '🍰', order: 6 },
];

let seeded = false;

export async function GET() {
  try {
    await dbConnect();

    if (!seeded) {
      const count = await Category.countDocuments();
      if (count === 0) {
        await Category.insertMany(DEFAULT_CATEGORIES);
      }
      seeded = true;
    }

    const categories = await Category.find({}).sort({ order: 1, name: 1 }).lean();

    return NextResponse.json(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
