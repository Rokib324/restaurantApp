'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { RestaurantLocation } from '@/data/locations';

const RestaurantMapInner = dynamic(
  () => import('./RestaurantMapInner'),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[420px] rounded-3xl bg-gray-900/60 border border-white/10 flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl">
        🗺️
      </div>
      <p className="text-gray-400 text-sm font-medium">Loading interactive Dhaka map...</p>
    </div>
  );
}

interface RestaurantMapProps {
  locations: RestaurantLocation[];
  activeLocation: RestaurantLocation;
  onSelectLocation: (location: RestaurantLocation) => void;
}

export default function RestaurantMap(props: RestaurantMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <MapSkeleton />;
  }

  return <RestaurantMapInner {...props} />;
}
