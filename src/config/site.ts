/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BRAND / WHITE-LABEL SETTINGS — shared types & defaults
 * ─────────────────────────────────────────────────────────────────────────────
 *  The live values are stored in MongoDB (SiteSettings model) and edited from
 *  the admin panel at /admin/settings. The defaults below are only used until
 *  an admin saves settings for the first time (or if the DB is unreachable).
 *
 *  - Server code:  `await getSiteSettings()`  from '@/lib/siteSettings'
 *  - Client code:  `useSiteSettings()`        from '@/components/providers/SiteSettingsProvider'
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SiteSettingsData {
  /** Display name of the restaurant */
  name: string;
  /** Substring of `name` rendered in the accent colour (optional) */
  nameHighlight: string;
  /** Legal / company name used in the copyright line */
  legalName: string;
  /** Short tagline shown under the logo in the footer */
  tagline: string;
  /** Default SEO meta description */
  description: string;
  /** Optional image logo (uploaded path or absolute URL). Takes priority over emoji. */
  logoUrl: string;
  /** Emoji used when no image logo is set */
  logoEmoji: string;
  /** Contact e-mail (also VAPID push-notification subject fallback) */
  email: string;
  /** Whether the kitchen is currently open */
  isKitchenOpen: boolean;
  /** Display text when the kitchen is open (e.g. "Kitchens Open Now") */
  kitchenOpenText: string;
  /** Display text when the kitchen is closed (e.g. "Kitchens are now close") */
  kitchenClosedText: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  name: 'FoodieExpress',
  nameHighlight: 'Express',
  legalName: 'FoodieExpress Bangladesh Ltd.',
  tagline: 'Fast Delivery · Dhaka',
  description:
    "Order delicious burgers, pizza, wraps and more — Dhaka's premier fast food delivery. Pay via bKash, Nagad, or Cash on Delivery.",
  logoUrl: '',
  logoEmoji: '🍔',
  email: 'admin@foodieexpress.bd',
  isKitchenOpen: true,
  kitchenOpenText: 'Kitchens Open Now',
  kitchenClosedText: 'Kitchens are now close',
};

export const SITE_SETTINGS_FIELDS = Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettingsData)[];

/**
 * Splits the brand name into [before, highlight, after] so UIs can colour
 * the highlighted portion. Falls back gracefully if the highlight isn't found.
 */
export function splitBrandName(name: string, highlight: string): [string, string, string] {
  const idx = highlight ? name.lastIndexOf(highlight) : -1;
  if (idx === -1) return [name, '', ''];
  return [name.slice(0, idx), highlight, name.slice(idx + highlight.length)];
}
