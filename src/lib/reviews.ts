import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import { DEFAULT_REVIEWS, ReviewItem } from '@/data/reviews';

export const REVIEWS_CACHE_TAG = 'reviews-list';

let hasSeededReviews = false;

/**
 * Ensures curated reviews are seeded into MongoDB on first initialization.
 */
export async function seedDefaultReviewsIfNeeded() {
  if (hasSeededReviews) return;
  try {
    await dbConnect();
    const count = await Review.countDocuments();
    if (count === 0) {
      const docs = DEFAULT_REVIEWS.map((rev, idx) => ({
        reviewerName: rev.reviewerName,
        reviewerTitle: rev.reviewerTitle,
        reviewerImage: rev.reviewerImage,
        platform: rev.platform,
        rating: rev.rating,
        reviewText: rev.reviewText,
        foodMentioned: rev.foodMentioned,
        sourceUrl: rev.sourceUrl || '',
        reviewDate: rev.reviewDate || 'Recently',
        isFeatured: rev.isFeatured !== false,
        isActive: rev.isActive !== false,
        order: rev.order ?? idx + 1,
      }));
      await Review.insertMany(docs);
      console.log('Successfully seeded default customer reviews into MongoDB');
    }
    hasSeededReviews = true;
  } catch (error) {
    console.error('Error seeding default reviews:', error);
  }
}

/**
 * Cached public query for active customer reviews displayed on the website.
 */
const fetchPublicReviews = unstable_cache(
  async (): Promise<ReviewItem[]> => {
    await dbConnect();
    await seedDefaultReviewsIfNeeded();

    const docs = await Review.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (!docs || docs.length === 0) {
      return DEFAULT_REVIEWS;
    }

    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        _id: String(doc._id),
        reviewerName: String(doc.reviewerName || ''),
        reviewerTitle: String(doc.reviewerTitle || 'Verified Customer'),
        reviewerImage: String(doc.reviewerImage || ''),
        platform: (doc.platform === 'facebook' ? 'facebook' : 'google') as 'facebook' | 'google',
        rating: Number(doc.rating) || 5,
        reviewText: String(doc.reviewText || ''),
        foodMentioned: String(doc.foodMentioned || ''),
        sourceUrl: String(doc.sourceUrl || ''),
        reviewDate: String(doc.reviewDate || 'Recently'),
        isFeatured: Boolean(doc.isFeatured),
        isActive: Boolean(doc.isActive),
        order: Number(doc.order) || 0,
        createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : undefined,
      };
    });
  },
  [REVIEWS_CACHE_TAG],
  { tags: [REVIEWS_CACHE_TAG], revalidate: 3600 }
);

export async function getPublicReviews(): Promise<ReviewItem[]> {
  try {
    return await fetchPublicReviews();
  } catch (err) {
    console.error('Failed to get reviews from DB, fallback to defaults:', err);
    return DEFAULT_REVIEWS;
  }
}

/**
 * Direct DB query for admin console (Server Component usage).
 */
export async function getAllReviewsAdmin(): Promise<ReviewItem[]> {
  try {
    await dbConnect();
    await seedDefaultReviewsIfNeeded();

    const docs = await Review.find({}).sort({ order: 1, createdAt: -1 }).lean();
    if (!docs || docs.length === 0) {
      return DEFAULT_REVIEWS;
    }

    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        _id: String(doc._id),
        reviewerName: String(doc.reviewerName || ''),
        reviewerTitle: String(doc.reviewerTitle || 'Verified Customer'),
        reviewerImage: String(doc.reviewerImage || ''),
        platform: (doc.platform === 'facebook' ? 'facebook' : 'google') as 'facebook' | 'google',
        rating: Number(doc.rating) || 5,
        reviewText: String(doc.reviewText || ''),
        foodMentioned: String(doc.foodMentioned || ''),
        sourceUrl: String(doc.sourceUrl || ''),
        reviewDate: String(doc.reviewDate || 'Recently'),
        isFeatured: Boolean(doc.isFeatured),
        isActive: Boolean(doc.isActive),
        order: Number(doc.order) || 0,
        createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : undefined,
      };
    });
  } catch (err) {
    console.error('Admin getAllReviews error:', err);
    return DEFAULT_REVIEWS;
  }
}
