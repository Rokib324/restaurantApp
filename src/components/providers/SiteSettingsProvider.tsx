'use client';

import { createContext, useContext, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, SiteSettingsData } from '@/config/site';

interface SiteSettingsContextValue {
  settings: SiteSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettingsData>>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  setSettings: () => {},
});

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsData;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettingsData>(value);
  const [prevValue, setPrevValue] = useState<SiteSettingsData>(value);

  if (prevValue !== value) {
    setPrevValue(value);
    setSettings(value);
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

/** Access the restaurant's brand settings from any client component. */
export function useSiteSettings(): SiteSettingsData {
  return useContext(SiteSettingsContext).settings;
}

/** Function to dynamically update client-side settings immediately. */
export function useSetSiteSettings() {
  const { setSettings } = useContext(SiteSettingsContext);
  return setSettings;
}

