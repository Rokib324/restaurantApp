'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RESTAURANT_LOCATIONS, RestaurantLocation } from '@/data/locations';
import RestaurantMap from './RestaurantMap';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

// Calculate distance in kilometers between two geo coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function LocationsSection() {
  const { name: brandName } = useSiteSettings();
  // Prefix each branch with the restaurant's brand name from admin settings
  const locations = useMemo(
    () => RESTAURANT_LOCATIONS.map((loc) => ({ ...loc, name: `${brandName} ${loc.name}` })),
    [brandName]
  );
  const [activeLocation, setActiveLocation] = useState<RestaurantLocation>(
    locations[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | '24/7' | 'dine-in' | 'drive-thru'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filter locations based on search and feature tags
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        searchQuery === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        (filterType === '24/7' && loc.is24HoursDelivery) ||
        (filterType === 'dine-in' && loc.features.includes('Dine-in')) ||
        (filterType === 'drive-thru' && loc.features.includes('Drive-thru'));

      return matchesSearch && matchesFilter;
    });
  }, [locations, searchQuery, filterType]);

  // Handle Find Nearest Branch via Geolocation
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        // Find nearest branch
        let nearestLoc = locations[0];
        let minDistance = Infinity;

        locations.forEach((loc) => {
          const dist = calculateDistance(userLat, userLng, loc.coordinates[0], loc.coordinates[1]);
          if (dist < minDistance) {
            minDistance = dist;
            nearestLoc = loc;
          }
        });

        setActiveLocation(nearestLoc);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError('Location access was denied or unavailable.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <section id="locations-section" className="py-24 relative overflow-hidden bg-gray-950">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>📍 Find Us in Dhaka</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white">
              Multiple Hubs,{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                One Fast Taste.
              </span>
            </h2>
            <p className="text-gray-400 text-base mt-2 max-w-xl">
              Visit our vibrant dining spots or order delivery right to your doorstep anywhere in Dhaka.
            </p>
          </div>

          {/* Locate Nearest Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              id="locate-nearest-btn"
              onClick={handleFindNearest}
              disabled={locating}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white font-semibold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{locating ? '⏳' : '🎯'}</span>
              <span>{locating ? 'Locating You...' : 'Find Nearest Branch'}</span>
            </button>
          </div>
        </div>

        {geoError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <span>⚠️ {geoError}</span>
            <button
              onClick={() => setGeoError(null)}
              className="text-red-400 hover:text-white font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>
            <input
              id="location-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g., Gulshan, Dhanmondi, Banani)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Branches' },
              { id: '24/7', label: '🌙 24/7 Delivery' },
              { id: 'dine-in', label: '🍽️ Dine-in' },
              { id: 'drive-thru', label: '🚗 Drive-thru' },
            ].map((tab) => {
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`location-filter-${tab.id}`}
                  onClick={() => setFilterType(tab.id as typeof filterType)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid: Locations List (Left) + Interactive Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Branch Cards List */}
          <div className="lg:col-span-5 space-y-4 max-h-[640px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filteredLocations.length === 0 ? (
                <div className="text-center py-16 bg-white/3 border border-white/10 rounded-3xl p-8">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-white font-semibold mb-1">No locations match your filter</p>
                  <p className="text-gray-400 text-xs">Try searching for another area or clear filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredLocations.map((loc) => {
                  const isSelected = loc.id === activeLocation.id;
                  const distance = userLocation
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        loc.coordinates[0],
                        loc.coordinates[1]
                      )
                    : null;

                  return (
                    <motion.div
                      key={loc.id}
                      id={`branch-card-${loc.id}`}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setActiveLocation(loc)}
                      className={`p-5 rounded-3xl transition-all duration-300 border cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-orange-500/15 via-white/5 to-transparent border-orange-500/50 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30'
                          : 'bg-white/4 border-white/10 hover:border-white/20 hover:bg-white/7'
                      }`}
                    >
                      {/* Active Indicator bar */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-red-500" />
                      )}

                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                              {loc.area}
                            </span>
                            {distance !== null && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                📍 {distance} km away
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                            {loc.name}
                          </h3>
                        </div>

                        {/* Status badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Open
                          </span>
                          <span className="text-xs text-yellow-400 font-bold flex items-center gap-0.5">
                            ★ {loc.rating}{' '}
                            <span className="text-gray-400 font-normal">({loc.reviewsCount})</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-xs leading-relaxed mb-3">
                        {loc.address}
                      </p>

                      <div className="text-xs text-gray-300 mb-3 flex items-center gap-1.5">
                        <span className="text-gray-500">🕒 Hours:</span>
                        <span className="font-medium text-gray-200">{loc.hours}</span>
                      </div>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {loc.features.map((feat) => (
                          <span
                            key={feat}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-[11px]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <a
                          href={loc.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
                        >
                          Directions ↗
                        </a>
                        <a
                          href={`tel:${loc.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <div className="lg:col-span-7 h-[640px] sticky top-24">
            <RestaurantMap
              locations={filteredLocations}
              activeLocation={activeLocation}
              onSelectLocation={(loc) => setActiveLocation(loc)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
