import mongoose, { Document, Schema, Model } from 'mongoose';
import { DEFAULT_SITE_SETTINGS, SiteSettingsData } from '@/config/site';

export interface ISiteSettings extends SiteSettingsData, Document {
  /** Fixed key so there is only ever one settings document */
  key: string;
  createdAt: Date;
  updatedAt: Date;
}

const d = DEFAULT_SITE_SETTINGS;

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, default: 'global', unique: true },
    name: { type: String, default: d.name, trim: true, maxlength: 80 },
    nameHighlight: { type: String, default: d.nameHighlight, trim: true, maxlength: 80 },
    legalName: { type: String, default: d.legalName, trim: true, maxlength: 120 },
    tagline: { type: String, default: d.tagline, trim: true, maxlength: 120 },
    description: { type: String, default: d.description, trim: true, maxlength: 300 },
    logoUrl: { type: String, default: d.logoUrl, trim: true },
    logoEmoji: { type: String, default: d.logoEmoji, trim: true, maxlength: 16 },
    email: { type: String, default: d.email, trim: true, lowercase: true },
    isKitchenOpen: { type: Boolean, default: d.isKitchenOpen },
    kitchenOpenText: { type: String, default: d.kitchenOpenText, trim: true, maxlength: 80 },
    kitchenClosedText: { type: String, default: d.kitchenClosedText, trim: true, maxlength: 80 },
  },
  { timestamps: true }
);

if (mongoose.models.SiteSettings) {
  delete (mongoose.models as Record<string, unknown>).SiteSettings;
}

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
