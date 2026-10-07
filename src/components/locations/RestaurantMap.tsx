'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RestaurantLocation } from '@/data/locations';

interface RestaurantMapProps {
  locations: RestaurantLocation[];
  activeLocation?: RestaurantLocation | null;
  onSelectLocation: (location: RestaurantLocation) => void;
}

export default function RestaurantMap({
  locations,
  activeLocation,
  onSelectLocation,
}: RestaurantMapProps) {
  const [zoomLevel, setZoomLevel] = useState<'street' | 'neighborhood'>('street');
  const [loadedKey, setLoadedKey] = useState<string>('');
  const [isCardMinimized, setIsCardMinimized] = useState<boolean>(false);

  const currentLoc = activeLocation || locations[0] || null;

  const rawCoords = currentLoc?.coordinates;
  const lat = Array.isArray(rawCoords) && !isNaN(rawCoords[0]) ? rawCoords[0] : 23.8103;
  const lng = Array.isArray(rawCoords) && !isNaN(rawCoords[1]) ? rawCoords[1] : 90.4125;

  // Bounding box delta based on zoom level
  const delta = zoomLevel === 'street' ? 0.005 : 0.015;
  const minLon = (lng - delta).toFixed(5);
  const maxLon = (lng + delta).toFixed(5);
  const minLat = (lat - delta * 0.75).toFixed(5);
  const maxLat = (lat + delta * 0.75).toFixed(5);

  // Free OpenStreetMap embed iframe URL with pinpoint marker
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;

  const currentId = currentLoc?.id || currentLoc?.slug || 'default';
  const currentKey = `${currentId}-${zoomLevel}`;
  const iframeLoading = loadedKey !== currentKey;
  const mapsUrl =
    currentLoc?.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  if (!currentLoc && locations.length === 0) {
    return (
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-full lg:min-h-[640px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl sm:text-3xl mb-4">
          🗺️
        </div>
        <h3 className="text-white text-base sm:text-lg font-bold mb-1">No Locations to Display</h3>
        <p className="text-gray-400 text-xs sm:text-sm max-w-sm">
          No restaurant branch matches your criteria. Select another filter or add locations in the Admin Panel.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-full lg:min-h-[640px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900 flex flex-col">
      {/* Top Header & Branch Switcher Bar */}
      <div className="bg-gray-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3 z-20 flex flex-wrap items-center justify-between gap-2">
        {/* Hub status badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold text-xs uppercase tracking-wider">
            {currentLoc?.area || 'Dhaka'} Hub
          </span>
          <span className="text-gray-500 text-xs hidden sm:inline">|</span>
          <span className="text-gray-400 text-xs hidden sm:inline">
            {locations.length} Locations across Dhaka
          </span>
        </div>

        {/* Zoom & Google Maps Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Level Switcher */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel('street')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                zoomLevel === 'street'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Street view zoom"
            >
              Street
            </button>
            <button
              onClick={() => setZoomLevel('neighborhood')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                zoomLevel === 'neighborhood'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Area overview zoom"
            >
              Area
            </button>
          </div>

          {/* External Google Maps Button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-semibold transition-all hover:scale-102"
          >
            <span>Google Maps</span>
            <span className="text-orange-400">↗</span>
          </a>
        </div>
      </div>

      {/* Quick Branch Switcher Pills */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-white/8 px-3 py-2 z-20 flex gap-1.5 overflow-x-auto scrollbar-none">
        {locations.map((loc) => {
          const isSelected = currentLoc && (loc.id === currentLoc.id || loc.slug === currentLoc.slug);
          return (
            <button
              key={loc.id || loc.slug}
              onClick={() => onSelectLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/25 scale-102'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 hover:border-white/15'
              }`}
            >
              <span>{isSelected ? '📍' : '○'}</span>
              <span>{loc.area}</span>
            </button>
          );
        })}
      </div>

      {/* Main Map Container with HTML Iframe */}
      <div className="relative flex-1 w-full h-full min-h-[380px] bg-gray-950">
        {/* Loading Skeleton */}
        {iframeLoading && (
          <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-3 z-10 animate-pulse pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl">
              🗺️
            </div>
            <p className="text-gray-300 text-sm font-semibold">
              Loading map for {currentLoc?.area || 'Dhaka'}…
            </p>
            <p className="text-gray-500 text-xs">
              Coordinates: {lat}, {lng}
            </p>
          </div>
        )}

        {/* Free HTML Map Embed Iframe */}
        <iframe
          key={currentKey}
          src={osmEmbedUrl}
          onLoad={() => setLoadedKey(currentKey)}
          className="w-full h-full border-0 absolute inset-0"
          title={`Map location of ${currentLoc?.name || 'Restaurant Branch'}`}
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Active Branch Information Overlay Card */}
        {currentLoc && (
          <motion.div
            key={currentId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm lg:max-w-md z-20 bg-gray-950/95 backdrop-blur-xl border border-white/15 p-3 sm:p-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md inline-block mb-1">
                  📍 {currentLoc.area} Branch
                </span>
                <h4 className="text-white font-extrabold text-xs sm:text-base leading-tight">
                  {currentLoc.name}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1 ${
                    currentLoc.isOpenNow
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentLoc.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  {currentLoc.isOpenNow ? 'Open' : 'Closed'}
                </span>
                {/* Mobile minimize/expand button */}
                <button
                  onClick={() => setIsCardMinimized(!isCardMinimized)}
                  className="sm:hidden w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                  title={isCardMinimized ? 'Expand info' : 'Minimize info'}
                  aria-label={isCardMinimized ? 'Expand info card' : 'Minimize info card'}
                >
                  {isCardMinimized ? '+' : '−'}
                </button>
              </div>
            </div>

            {!isCardMinimized && (
              <>
                <p className="text-gray-400 text-[11px] sm:text-xs line-clamp-2 mb-2">
                  {currentLoc.address}
                </p>

                {/* Direct hotline display */}
                <div className="bg-white/5 border border-white/8 rounded-xl px-2.5 py-1.5 mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[10px] sm:text-[11px]">
                    Hotline: <strong className="text-orange-400 font-bold">{currentLoc.phone}</strong>
                  </span>
                  <a
                    href={`tel:${currentLoc.phone}`}
                    className="text-[10px] sm:text-[11px] font-bold text-orange-300 hover:text-orange-200 underline"
                  >
                    Call Branch
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300 pt-1.5 border-t border-white/10 gap-2 flex-wrap">
                  <span className="text-gray-400 text-[10px] sm:text-[11px]">🕒 {currentLoc.hours}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${currentLoc.phone}`}
                      className="text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      📞 Call
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors shadow-sm"
                    >
                      Directions ↗
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
