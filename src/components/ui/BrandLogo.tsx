'use client';

import Image from 'next/image';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

interface BrandLogoProps {
  /** Rendered size in px for image logos */
  size?: number;
  /** Classes applied to the emoji fallback */
  className?: string;
  /** Override settings (used for live previews in the admin panel) */
  logoUrl?: string;
  logoEmoji?: string;
  name?: string;
}

/**
 * Renders the restaurant logo: the uploaded image if one is set,
 * otherwise the configured emoji. Values come from admin settings.
 */
export default function BrandLogo({ size = 32, className = '', ...overrides }: BrandLogoProps) {
  const settings = useSiteSettings();
  const logoUrl = overrides.logoUrl ?? settings.logoUrl;
  const logoEmoji = overrides.logoEmoji ?? settings.logoEmoji;
  const name = overrides.name ?? settings.name;

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        unoptimized
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className={className} role="img" aria-label={`${name} logo`}>
      {logoEmoji}
    </span>
  );
}
