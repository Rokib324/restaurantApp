import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Item from '@/models/Item';

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

    // Auto-seed if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany([
        { name: 'Burgers', slug: 'burgers', emoji: '🍔', order: 1 },
        { name: 'Pizza', slug: 'pizza', emoji: '🍕', order: 2 },
        { name: 'Wraps', slug: 'wraps', emoji: '🌯', order: 3 },
        { name: 'Sides', slug: 'sides', emoji: '🍟', order: 4 },
        { name: 'Drinks', slug: 'drinks', emoji: '🥤', order: 5 },
        { name: 'Desserts', slug: 'desserts', emoji: '🍰', order: 6 },
      ]);
    }

    const [categories, itemCounts] = await Promise.all([
      Category.find({}).sort({ order: 1, name: 1 }).lean(),
      Item.aggregate([
        { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } },
      ]),
    ]);

    const countMap: Record<string, number> = {};
    itemCounts.forEach((c) => {
      if (c._id) countMap[c._id] = c.count;
    });

    const dataWithCounts = categories.map((cat) => ({
      ...cat,
      itemCount: countMap[cat.slug.toLowerCase()] || 0,
    }));

    return NextResponse.json({ success: true, data: dataWithCounts });
  } catch (error) {
    console.error('Admin GET /categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
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
    const { name, slug, emoji, description, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const categorySlug = (slug?.trim() || slugify(name)).toLowerCase();

    // Check if slug already exists
    const existing = await Category.findOne({ slug: categorySlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Category with slug "${categorySlug}" already exists.` },
        { status: 400 }
      );
    }

    // Determine order
    let finalOrder = typeof order === 'number' ? order : 0;
    if (!order) {
      const highest = await Category.findOne().sort({ order: -1 }).select('order');
      finalOrder = (highest?.order || 0) + 1;
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug: categorySlug,
      emoji: emoji?.trim() || '🍽️',
      description: description?.trim() || '',
      order: finalOrder,
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Admin POST /categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
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
    const { categoryId, name, slug, emoji, description, order } = body;

    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'categoryId is required' }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const oldSlug = category.slug;
    let newSlug = oldSlug;

    if (slug && slug.trim()) {
      newSlug = slugify(slug);
      if (newSlug !== oldSlug) {
        const existing = await Category.findOne({ slug: newSlug, _id: { $ne: categoryId } });
        if (existing) {
          return NextResponse.json(
            { success: false, error: `Category with slug "${newSlug}" already exists.` },
            { status: 400 }
          );
        }
      }
    }

    if (name) category.name = name.trim();
    if (slug) category.slug = newSlug;
    if (emoji !== undefined) category.emoji = emoji.trim() || '🍽️';
    if (description !== undefined) category.description = description.trim();
    if (order !== undefined) category.order = Number(order);

    await category.save();

    // If slug changed, update all existing items that use oldSlug
    if (newSlug !== oldSlug) {
      await Item.updateMany({ category: oldSlug }, { category: newSlug });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Admin PATCH /categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
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
    const id = searchParams.get('id');
    const deleteItems = searchParams.get('deleteItems') === 'true';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if items are associated with this category
    const itemCount = await Item.countDocuments({ category: category.slug });

    if (itemCount > 0 && !deleteItems) {
      // Reassign items to 'other' or prompt user
      // Let's create an 'Other' category if needed or reassign
      return NextResponse.json({
        success: false,
        hasItems: true,
        itemCount,
        message: `This category has ${itemCount} food item(s) attached. Please confirm deletion.`,
      }, { status: 409 });
    }

    if (itemCount > 0 && deleteItems) {
      // Delete associated items
      await Item.deleteMany({ category: category.slug });
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
      deletedItemCount: deleteItems ? itemCount : 0,
    });
  } catch (error) {
    console.error('Admin DELETE /categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
