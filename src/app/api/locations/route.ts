import { NextResponse } from 'next/server';
import { getActiveLocations } from '@/lib/locations';

export async function GET() {
  try {
    const locations = await getActiveLocations();
    return NextResponse.json(
      { success: true, data: locations },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurant locations' },
      { status: 500 }
    );
  }
}
