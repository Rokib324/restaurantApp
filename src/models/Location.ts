import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  slug: string;
  area: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  phone: string;
  hours: string;
  isOpenNow: boolean;
  is24HoursDelivery: boolean;
  features: string[];
  rating: number;
  reviewsCount: number;
  googleMapsUrl: string;
  popularDish: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    area: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => Array.isArray(v) && v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]),
        message: 'Coordinates must be an array of [latitude, longitude]',
      },
    },
    phone: { type: String, required: true, trim: true },
    hours: { type: String, default: '10:00 AM – 11:00 PM', trim: true },
    isOpenNow: { type: Boolean, default: true },
    is24HoursDelivery: { type: Boolean, default: false },
    features: { type: [String], default: ['Dine-in', 'Takeaway', 'Delivery'] },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 100, min: 0 },
    googleMapsUrl: { type: String, default: '', trim: true },
    popularDish: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LocationSchema.index({ order: 1, createdAt: 1 });
LocationSchema.index({ isActive: 1 });

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
