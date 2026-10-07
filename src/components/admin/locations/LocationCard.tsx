'use client';

import React, { memo } from 'react';

export interface LocationItem {
  _id: string;
  name: string;
  slug: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: [number, number];
  isOpenNow: boolean;
  is24HoursDelivery: boolean;
  features: string[];
  rating: number;
  reviewsCount: number;
  googleMapsUrl: string;
  popularDish: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LocationCardProps {
  loc: LocationItem;
  onQuickToggle: (id: string, field: 'isActive' | 'isOpenNow' | 'is24HoursDelivery', currentVal: boolean) => void;
  onEdit: (loc: LocationItem) => void;
  onDelete: (loc: LocationItem) => void;
}

const LocationCard = memo(function LocationCard({
  loc,
  onQuickToggle,
  onEdit,
  onDelete,
}: LocationCardProps) {
  const mapsLink =
    loc.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${loc.coordinates[0]},${loc.coordinates[1]}`;

  return (
    <div
      className={`border rounded-3xl p-5 flex flex-col justify-between transition-colors duration-150 ${
        loc.isActive
          ? 'bg-white/5 border-white/8 hover:border-white/20'
          : 'bg-white/2 border-white/5 opacity-60'
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-md">
                {loc.area}
              </span>
              {loc.is24HoursDelivery && (
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
                  🌙 24/7
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{loc.name}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onQuickToggle(loc._id, 'isOpenNow', loc.isOpenNow)}
              title="Click to toggle Open / Closed status"
              className={`cursor-pointer px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border transition-colors ${
                loc.isOpenNow
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  loc.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>{loc.isOpenNow ? 'Open' : 'Closed'}</span>
            </button>
          </div>
        </div>

        {/* Phone Hotline */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base text-orange-400">📞</span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-orange-300/80 tracking-wider">
                Branch Phone
              </p>
              <a
                href={`tel:${loc.phone}`}
                className="text-white font-extrabold text-sm hover:text-orange-400 transition-colors truncate block"
              >
                {loc.phone}
              </a>
            </div>
          </div>
          <a
            href={`tel:${loc.phone}`}
            className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            Call
          </a>
        </div>

        {/* Address & Hours */}
        <div className="space-y-1.5 text-xs text-gray-300 mb-3">
          <p className="flex items-start gap-1.5 text-gray-400">
            <span className="text-gray-500 flex-shrink-0 mt-0.5">📍</span>
            <span className="line-clamp-2">{loc.address}</span>
          </p>
          <p className="flex items-center gap-1.5 text-gray-400">
            <span className="text-gray-500 flex-shrink-0">🕒</span>
            <span>{loc.hours}</span>
          </p>
          <p className="flex items-center gap-1.5 text-gray-400">
            <span className="text-gray-500 flex-shrink-0">🗺️</span>
            <span className="font-mono text-[11px] text-gray-400">
              {loc.coordinates?.[0]?.toFixed(4)}, {loc.coordinates?.[1]?.toFixed(4)}
            </span>
          </p>
        </div>

        {/* Features Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          {loc.features?.slice(0, 4).map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-[11px] text-gray-300"
            >
              {f}
            </span>
          ))}
          {loc.features && loc.features.length > 4 && (
            <span className="px-1.5 py-0.5 bg-white/5 rounded-md text-[10px] text-gray-500">
              +{loc.features.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onQuickToggle(loc._id, 'isActive', loc.isActive)}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors ${
            loc.isActive
              ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}
          title={loc.isActive ? 'Hide from website' : 'Show on website'}
        >
          {loc.isActive ? 'Visible' : 'Hidden'}
        </button>

        <div className="flex items-center gap-2">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-colors"
            title="View on Google Maps"
          >
            🗺️
          </a>
          <button
            type="button"
            onClick={() => onEdit(loc)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(loc)}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs transition-colors"
            title="Delete location"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
});

export default LocationCard;
