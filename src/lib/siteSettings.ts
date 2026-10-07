import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_FIELDS, SiteSettingsData } from '@/config/site';

export const SITE_SETTINGS_TAG = 'site-settings';

/** Picks only known fields and fills any gaps with defaults. */
export function normalizeSettings(raw: Partial<Record<string, unknown>> | null | undefined): SiteSettingsData {
  const out = { ...DEFAULT_SITE_SETTINGS };
  if (!raw) return out;
  for (const field of SITE_SETTINGS_FIELDS) {
    const v = raw[field];
    if (typeof v === 'string') {
      (out as Record<string, unknown>)[field] = v;
    } else if (typeof v === 'boolean') {
      (out as Record<string, unknown>)[field] = v;
    }
  }
  return out;
}

const readSettingsFromDb = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    await dbConnect();
    const doc = await SiteSettings.findOne({ key: 'global' }).lean();
    return normalizeSettings(doc as Record<string, unknown> | null);
  },
  [SITE_SETTINGS_TAG],
  { tags: [SITE_SETTINGS_TAG], revalidate: 3600 }
);

/**
 * Server-side accessor for the restaurant's brand settings.
 * Cached; invalidated whenever an admin saves settings.
 * Never throws — falls back to defaults if the database is unreachable.
 */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    return await readSettingsFromDb();
  } catch (error) {
    console.error('getSiteSettings: falling back to defaults', error);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}
