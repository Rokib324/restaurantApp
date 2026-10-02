import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  emoji: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emoji: { type: String, default: '🍽️', trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ order: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
