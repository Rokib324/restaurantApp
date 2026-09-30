import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IItem extends Document {
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true, lowercase: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create compound index for category + availability queries
ItemSchema.index({ category: 1, isAvailable: 1 });
ItemSchema.index({ tags: 1 });

const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
