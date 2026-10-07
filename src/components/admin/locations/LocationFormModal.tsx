'use client';

import React, { useState } from 'react';
import { LocationItem } from './LocationCard';

const COMMON_FEATURES = [
  'Dine-in',
  'Takeaway',
  'Delivery',
  '24/7 Delivery',
  'Drive-thru',
  'Rooftop Lounge',
  'WiFi & Workspaces',
  'Outdoor Seating',
  'Family Zone',
  'Express Counter',
];

const DHAKA_PRESETS = [
  { name: 'Gulshan 2', lat: 23.7925, lng: 90.4167 },
  { name: 'Banani 11', lat: 23.7937, lng: 90.4043 },
  { name: 'Dhanmondi', lat: 23.7516, lng: 90.3725 },
  { name: 'Uttara Sec 7', lat: 23.8681, lng: 90.3984 },
  { name: 'Mirpur 10', lat: 23.8069, lng: 90.3687 },
  { name: 'Bashundhara', lat: 23.8166, lng: 90.4358 },
  { name: 'Mohakhali', lat: 23.7776, lng: 90.4054 },
];

const inputCls =
  'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-colors';

interface LocationFormModalProps {
  location: LocationItem | null; // null means 'Add Location'
  defaultOrder?: number;
  onClose: () => void;
  onSuccess: (saved: LocationItem) => void;
}

export default function LocationFormModal({
  location,
  defaultOrder = 1,
  onClose,
  onSuccess,
}: LocationFormModalProps) {
  const isEditing = !!location;

  // Local form state - completely isolated from parent page
  const [formName, setFormName] = useState(location?.name || '');
  const [formArea, setFormArea] = useState(location?.area || '');
  const [formAddress, setFormAddress] = useState(location?.address || '');
  const [formPhone, setFormPhone] = useState(location?.phone || '+880 1711-');
  const [formHours, setFormHours] = useState(location?.hours || '10:00 AM – 11:00 PM');
  const [formLat, setFormLat] = useState(
    location?.coordinates?.[0] ? String(location.coordinates[0]) : '23.7925'
  );
  const [formLng, setFormLng] = useState(
    location?.coordinates?.[1] ? String(location.coordinates[1]) : '90.4167'
  );
  const [formMapsUrl, setFormMapsUrl] = useState(location?.googleMapsUrl || '');
  const [formPopularDish, setFormPopularDish] = useState(location?.popularDish || '');
  const [formFeatures, setFormFeatures] = useState<string[]>(
    Array.isArray(location?.features) && location.features.length > 0
      ? location.features
      : ['Dine-in', 'Takeaway', 'Delivery']
  );
  const [customFeature, setCustomFeature] = useState('');
  const [formRating, setFormRating] = useState(String(location?.rating ?? 4.8));
  const [formReviews, setFormReviews] = useState(String(location?.reviewsCount ?? 120));
  const [formIsOpen, setFormIsOpen] = useState(location ? location.isOpenNow !== false : true);
  const [formIs24h, setFormIs24h] = useState(!!location?.is24HoursDelivery);
  const [formIsActive, setFormIsActive] = useState(location ? location.isActive !== false : true);
  const [formOrder, setFormOrder] = useState(String(location?.order ?? defaultOrder));

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleFeature = (feat: string) => {
    setFormFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const addCustomFeature = () => {
    const val = customFeature.trim();
    if (val && !formFeatures.includes(val)) {
      setFormFeatures((prev) => [...prev, val]);
      setCustomFeature('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formArea.trim() || !formAddress.trim() || !formPhone.trim()) {
      setErrorMsg('Please fill in Branch Name, Area, Address, and Phone Number.');
      return;
    }

    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: formName.trim(),
      area: formArea.trim(),
      address: formAddress.trim(),
      phone: formPhone.trim(),
      hours: formHours.trim(),
      coordinates: [lat, lng],
      googleMapsUrl: formMapsUrl.trim(),
      popularDish: formPopularDish.trim(),
      features: formFeatures,
      rating: parseFloat(formRating) || 4.8,
      reviewsCount: parseInt(formReviews) || 100,
      isOpenNow: formIsOpen,
      is24HoursDelivery: formIs24h,
      isActive: formIsActive,
      order: parseInt(formOrder) || 0,
    };

    try {
      const url = '/api/admin/locations';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing ? JSON.stringify({ id: location._id, ...payload }) : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} location`);
      }

      onSuccess(data.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving location');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="bg-gray-900 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-full my-6 sm:my-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {isEditing ? '✏️ Edit Branch Location' : '➕ Add New Branch Location'}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Update location details, customer hotline, and map pin coordinates.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Branch Name *
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Gulshan Flagship"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Area / Neighborhood *
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Gulshan 2 or Dhanmondi"
                value={formArea}
                onChange={(e) => setFormArea(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Phone Hotline & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-400 mb-1.5 flex items-center gap-1">
                <span>📞 Phone Hotline *</span>
              </label>
              <input
                type="tel"
                className={`${inputCls} font-bold text-white`}
                placeholder="e.g. +880 1711-001122"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Customers will call this number directly from the website.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Operating Hours
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. 10:00 AM – 02:00 AM (24/7 Delivery)"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Full Physical Address *
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Plot 12, Road 71, Gulshan 2, Dhaka 1212"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              required
            />
          </div>

          {/* Map Coordinates with Dhaka Presets */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                🗺️ Map Coordinates (Latitude &amp; Longitude) *
              </label>
              <span className="text-[11px] text-gray-500">Required for interactive map</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Latitude</span>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="23.7925"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Longitude</span>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="90.4167"
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Dhaka Area Quick Fill buttons */}
            <div>
              <p className="text-[11px] text-gray-500 mb-1.5">Quick fill Dhaka preset coordinates:</p>
              <div className="flex flex-wrap gap-1.5">
                {DHAKA_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFormLat(String(p.lat));
                      setFormLng(String(p.lng));
                      if (!formArea) setFormArea(p.name);
                    }}
                    className="px-2 py-1 bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 border border-white/10 rounded-lg text-[11px] text-gray-300 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Google Maps Link & Signature Dish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Custom Google Maps URL (optional)
              </label>
              <input
                type="url"
                className={inputCls}
                placeholder="Leave blank to auto-generate from coordinates"
                value={formMapsUrl}
                onChange={(e) => setFormMapsUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Signature / Popular Dish (optional)
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Double Patty Smash Burger"
                value={formPopularDish}
                onChange={(e) => setFormPopularDish(e.target.value)}
              />
            </div>
          </div>

          {/* Features Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Branch Features &amp; Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_FEATURES.map((feat) => {
                const selected = formFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {feat}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className={inputCls}
                placeholder="Add custom tag (e.g. Kids Play Area)..."
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Status Toggles & Order */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input
                type="checkbox"
                checked={formIsOpen}
                onChange={(e) => setFormIsOpen(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 accent-orange-500"
              />
              <span>Open Now</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input
                type="checkbox"
                checked={formIs24h}
                onChange={(e) => setFormIs24h(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 accent-purple-500"
              />
              <span>24/7 Delivery</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Active on Site</span>
            </label>

            <div>
              <span className="text-[11px] text-gray-400 block mb-0.5">Display Order</span>
              <input
                type="number"
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                value={formOrder}
                onChange={(e) => setFormOrder(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>💾</span>
              )}
              <span>{isEditing ? 'Save Updates' : 'Create Location'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
