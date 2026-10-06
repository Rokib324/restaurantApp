'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_SITE_SETTINGS, SiteSettingsData } from '@/config/site';

const SiteSettingsContext = createContext<SiteSettingsData>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsData;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

/** Access the restaurant's brand settings from any client component. */
export function useSiteSettings(): SiteSettingsData {
  return useContext(SiteSettingsContext);
}
