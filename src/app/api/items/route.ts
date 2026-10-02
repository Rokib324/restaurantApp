import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

// Seed data for demo purposes
const SEED_ITEMS = [
  {
    name: 'Classic Beef Burger',
    slug: 'classic-beef-burger',
    price: 180,
    category: 'burgers',
    description: 'Juicy 100% beef patty with fresh lettuce, tomato, onion, and our special sauce in a toasted sesame bun.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    tags: ['beef', 'popular', 'grill'],
    isAvailable: true,
  },
  {
    name: 'Spicy Chicken Burger',
    slug: 'spicy-chicken-burger',
    price: 160,
    category: 'burgers',
    description: 'Crispy fried chicken with spicy jalapeño sauce, coleslaw, and pickles.',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80',
    tags: ['chicken', 'spicy', 'crispy'],
    isAvailable: true,
  },
  {
    name: 'Double Patty Smash Burger',
    slug: 'double-patty-smash-burger',
    price: 250,
    category: 'burgers',
    description: 'Two smashed beef patties with American cheese, caramelized onions and secret smash sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80',
    tags: ['beef', 'double', 'premium', 'popular'],
    isAvailable: true,
  },
  {
    name: 'Margherita Pizza',
    slug: 'margherita-pizza',
    price: 320,
    category: 'pizza',
    description: 'Classic Italian pizza with fresh mozzarella, San Marzano tomato sauce, and fresh basil.',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    tags: ['vegetarian', 'classic', 'cheese'],
    isAvailable: true,
  },
  {
    name: 'BBQ Chicken Pizza',
    slug: 'bbq-chicken-pizza',
    price: 380,
    category: 'pizza',
    description: 'Smoky BBQ sauce base, grilled chicken, red onions, and mozzarella cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    tags: ['chicken', 'bbq', 'popular'],
    isAvailable: true,
  },
  {
    name: 'Pepperoni Feast Pizza',
    slug: 'pepperoni-feast-pizza',
    price: 420,
    category: 'pizza',
    description: 'Double pepperoni, extra mozzarella on our signature tomato sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
    tags: ['pepperoni', 'meaty', 'popular'],
    isAvailable: true,
  },
  {
    name: 'Crispy French Fries',
    slug: 'crispy-french-fries',
    price: 80,
    category: 'sides',
    description: 'Golden, crispy fries seasoned with our special spice blend.',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80',
    tags: ['vegetarian', 'crispy', 'snack'],
    isAvailable: true,
  },
  {
    name: 'Onion Rings',
    slug: 'onion-rings',
    price: 90,
    category: 'sides',
    description: 'Beer-battered onion rings fried to golden perfection.',
    imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80',
    tags: ['vegetarian', 'crispy', 'snack'],
    isAvailable: true,
  },
  {
    name: 'Loaded Mozzarella Sticks',
    slug: 'loaded-mozzarella-sticks',
    price: 120,
    category: 'sides',
    description: 'Crispy breaded mozzarella sticks with marinara dipping sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&q=80',
    tags: ['cheese', 'crispy', 'vegetarian'],
    isAvailable: true,
  },
  {
    name: 'Mango Lassi',
    slug: 'mango-lassi',
    price: 70,
    category: 'drinks',
    description: 'Refreshing chilled mango lassi made with fresh Alphonso mangoes and yogurt.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    tags: ['mango', 'cold', 'refreshing', 'desi'],
    isAvailable: true,
  },
  {
    name: 'Borhani (Spiced Yogurt Drink)',
    slug: 'borhani-spiced-yogurt',
    price: 60,
    category: 'drinks',
    description: 'Traditional Bangladeshi spiced yogurt drink with mint, cumin, and black pepper.',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
    tags: ['desi', 'traditional', 'spiced', 'popular'],
    isAvailable: true,
  },
  {
    name: 'Fresh Lemon Sharbat',
    slug: 'lemon-sharbat',
    price: 50,
    category: 'drinks',
    description: 'Sweet-sour fresh lemon juice with rooh afza syrup and mint.',
    imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80',
    tags: ['lemon', 'refreshing', 'desi'],
    isAvailable: true,
  },
  {
    name: 'Chicken Shawarma Wrap',
    slug: 'chicken-shawarma-wrap',
    price: 140,
    category: 'wraps',
    description: 'Marinated grilled chicken, garlic sauce, pickles, tomato in a warm flatbread.',
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80',
    tags: ['chicken', 'popular', 'wrap'],
    isAvailable: true,
  },
  {
    name: 'Beef Kathi Roll',
    slug: 'beef-kathi-roll',
    price: 120,
    category: 'wraps',
    description: 'Spiced minced beef wrapped in a paratha with onions, green chilli and coriander chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
    tags: ['beef', 'desi', 'spicy', 'popular'],
    isAvailable: true,
  },
  {
    name: 'Chocolate Lava Cake',
    slug: 'chocolate-lava-cake',
    price: 150,
    category: 'desserts',
    description: 'Warm molten chocolate cake with vanilla ice cream and chocolate drizzle.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    tags: ['chocolate', 'sweet', 'warm'],
    isAvailable: true,
  },
  {
    name: 'Mango Ice Cream Sundae',
    slug: 'mango-ice-cream-sundae',
    price: 110,
    category: 'desserts',
    description: 'Three scoops of mango ice cream with fresh mango chunks, whipped cream, and wafers.',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
    tags: ['mango', 'cold', 'sweet', 'popular'],
    isAvailable: true,
  },
];

// In-memory cache for ultra-fast responses
let cachedItems: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let isSeeded = false;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const now = Date.now();

    // If cache is valid, serve directly from memory (0-1ms response)
    if (cachedItems && now - lastCacheTime < CACHE_TTL_MS) {
      let filtered = cachedItems;
      if (category && category !== 'all') {
        filtered = cachedItems.filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        );
      }
      return NextResponse.json(
        { success: true, data: filtered },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    await dbConnect();

    // Seed once if needed
    if (!isSeeded) {
      const count = await Item.countDocuments();
      if (count === 0) {
        await Item.insertMany(SEED_ITEMS);
      }
      isSeeded = true;
    }

    // Fetch all available items to refresh cache
    const allItems = await Item.find({ isAvailable: true }).sort({ createdAt: -1 }).lean();
    cachedItems = allItems;
    lastCacheTime = now;

    let filtered = allItems;
    if (category && category !== 'all') {
      filtered = allItems.filter(
        (item: any) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json(
      { success: true, data: filtered },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/items error:', error);
    // If DB fails but we have stale cache, serve it
    if (cachedItems) {
      return NextResponse.json({ success: true, data: cachedItems }, { status: 200 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
