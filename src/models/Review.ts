import mongoose, { Document, Schema, Model } from 'mongoose';

export type ReviewPlatform = 'facebook' | 'google';

export interface IReview extends Document {
  reviewerName: string;
  reviewerTitle: string;
  reviewerImage: string;
  platform: ReviewPlatform;
  rating: number;
  reviewText: string;
  foodMentioned: string;
  sourceUrl: string;
  reviewDate: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewerName: { type: String, required: true, trim: true },
    reviewerTitle: { type: String, default: 'Verified Customer', trim: true },
    reviewerImage: { type: String, default: '', trim: true },
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'google'],
      default: 'google',
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    reviewText: { type: String, required: true, trim: true },
    foodMentioned: { type: String, default: '', trim: true },
    sourceUrl: { type: String, default: '', trim: true },
    reviewDate: { type: String, default: 'Recently', trim: true },
    isFeatured: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ isActive: 1, order: 1, createdAt: -1 });

if (mongoose.models.Review) {
  delete (mongoose.models as Record<string, unknown>).Review;
}

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
