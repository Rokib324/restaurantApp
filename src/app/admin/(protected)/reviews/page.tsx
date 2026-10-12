import { getAllReviewsAdmin } from '@/lib/reviews';
import AdminReviewsClient from '@/components/admin/reviews/AdminReviewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const initialReviews = await getAllReviewsAdmin();

  return <AdminReviewsClient initialReviews={initialReviews} />;
}
