import { NextResponse } from 'next/server';
import { getPublicReviews } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await getPublicReviews();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Public GET /api/reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
