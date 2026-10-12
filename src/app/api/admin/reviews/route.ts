import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminFromCookies } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { REVIEWS_CACHE_TAG, seedDefaultReviewsIfNeeded } from '@/lib/reviews';

export async function GET() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    await seedDefaultReviewsIfNeeded();

    const reviews = await Review.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Admin GET /reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
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
      reviewerName,
      reviewerTitle,
      reviewerImage,
      platform,
      rating,
      reviewText,
      foodMentioned,
      sourceUrl,
      reviewDate,
      isFeatured,
      isActive,
      order,
    } = body;

    if (!reviewerName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reviewer name is required.' },
        { status: 400 }
      );
    }

    if (!reviewText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Review text/comment is required.' },
        { status: 400 }
      );
    }

    const validPlatform = platform === 'facebook' ? 'facebook' : 'google';
    const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = await Review.create({
      reviewerName: reviewerName.trim(),
      reviewerTitle: reviewerTitle?.trim() || 'Verified Customer',
      reviewerImage: reviewerImage?.trim() || '',
      platform: validPlatform,
      rating: parsedRating,
      reviewText: reviewText.trim(),
      foodMentioned: foodMentioned?.trim() || '',
      sourceUrl: sourceUrl?.trim() || '',
      reviewDate: reviewDate?.trim() || 'Recently',
      isFeatured: isFeatured !== false,
      isActive: isActive !== false,
      order: !isNaN(Number(order)) ? Number(order) : 0,
    });

    revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    console.error('Admin POST /reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
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
    const { id, reviewId, ...updates } = body;
    const targetId = id || reviewId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (updates.reviewerName !== undefined) updateData.reviewerName = updates.reviewerName.trim();
    if (updates.reviewerTitle !== undefined) updateData.reviewerTitle = updates.reviewerTitle.trim();
    if (updates.reviewerImage !== undefined) updateData.reviewerImage = updates.reviewerImage.trim();
    if (updates.platform !== undefined) {
      updateData.platform = updates.platform === 'facebook' ? 'facebook' : 'google';
    }
    if (updates.rating !== undefined) {
      updateData.rating = Math.min(5, Math.max(1, Number(updates.rating)));
    }
    if (updates.reviewText !== undefined) updateData.reviewText = updates.reviewText.trim();
    if (updates.foodMentioned !== undefined) updateData.foodMentioned = updates.foodMentioned.trim();
    if (updates.sourceUrl !== undefined) updateData.sourceUrl = updates.sourceUrl.trim();
    if (updates.reviewDate !== undefined) updateData.reviewDate = updates.reviewDate.trim();
    if (updates.isFeatured !== undefined) updateData.isFeatured = Boolean(updates.isFeatured);
    if (updates.isActive !== undefined) updateData.isActive = Boolean(updates.isActive);
    if (updates.order !== undefined) updateData.order = Number(updates.order) || 0;

    const updated = await Review.findByIdAndUpdate(targetId, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin PATCH /reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
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
      return NextResponse.json({ success: false, error: 'Review ID is required.' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Admin DELETE /reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
