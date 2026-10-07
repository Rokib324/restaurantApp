'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
  'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<LocationItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('10:00 AM – 11:00 PM');
  const [formLat, setFormLat] = useState('23.7925');
  const [formLng, setFormLng] = useState('90.4167');
  const [formMapsUrl, setFormMapsUrl] = useState('');
  const [formPopularDish, setFormPopularDish] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['Dine-in', 'Takeaway', 'Delivery']);
  const [customFeature, setCustomFeature] = useState('');
  const [formRating, setFormRating] = useState('4.8');
  const [formReviews, setFormReviews] = useState('150');
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [formIs24h, setFormIs24h] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrder, setFormOrder] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/locations')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && Array.isArray(data.data)) {
          setLocations(data.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch locations:', err);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Open Add modal with fresh defaults
  const openAdd = () => {
    setFormName('');
    setFormArea('');
    setFormAddress('');
    setFormPhone('+880 1711-');
    setFormHours('10:00 AM – 11:00 PM');
    setFormLat('23.7925');
    setFormLng('90.4167');
    setFormMapsUrl('');
    setFormPopularDish('');
    setFormFeatures(['Dine-in', 'Takeaway', 'Delivery']);
    setCustomFeature('');
    setFormRating('4.8');
    setFormReviews('120');
    setFormIsOpen(true);
    setFormIs24h(false);
    setFormIsActive(true);
    setFormOrder(String(locations.length + 1));
    setErrorMsg(null);
    setShowAddModal(true);
  };

  // Open Edit modal populated with existing location
  const openEdit = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormArea(loc.area);
    setFormAddress(loc.address);
    setFormPhone(loc.phone);
    setFormHours(loc.hours || '10:00 AM – 11:00 PM');
    setFormLat(loc.coordinates?.[0] ? String(loc.coordinates[0]) : '23.8103');
    setFormLng(loc.coordinates?.[1] ? String(loc.coordinates[1]) : '90.4125');
    setFormMapsUrl(loc.googleMapsUrl || '');
    setFormPopularDish(loc.popularDish || '');
    setFormFeatures(Array.isArray(loc.features) ? loc.features : []);
    setCustomFeature('');
    setFormRating(String(loc.rating ?? 4.8));
    setFormReviews(String(loc.reviewsCount ?? 100));
    setFormIsOpen(loc.isOpenNow !== false);
    setFormIs24h(!!loc.is24HoursDelivery);
    setFormIsActive(loc.isActive !== false);
    setFormOrder(String(loc.order ?? 0));
    setErrorMsg(null);
  };

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

  // Quick toggle active / open state
  const handleQuickToggle = async (
    id: string,
    field: 'isActive' | 'isOpenNow' | 'is24HoursDelivery',
    currentVal: boolean
  ) => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setLocations((prev) =>
          prev.map((loc) => (loc._id === id ? { ...loc, [field]: !currentVal } : loc))
        );
      }
    } catch (err) {
      console.error('Quick toggle error:', err);
    }
  };

  // Save new location
  const handleCreate = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create location');
      }

      setShowAddModal(false);
      await fetchLocations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating location');
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing location
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    if (!formName.trim() || !formArea.trim() || !formAddress.trim() || !formPhone.trim()) {
      setErrorMsg('Please fill in Branch Name, Area, Address, and Phone Number.');
      return;
    }

    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg('Please enter valid numeric coordinates.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLocation._id,
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update location');
      }

      setEditingLocation(null);
      await fetchLocations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating location');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete location
  const handleDelete = async () => {
    if (!deletingLocation) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/locations?id=${deletingLocation._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete location');
      }
      setDeletingLocation(null);
      await fetchLocations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error deleting location');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.area.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.phone.toLowerCase().includes(q)
    );
  });

  const totalBranches = locations.length;
  const activeBranches = locations.filter((l) => l.isActive).length;
  const delivery24h = locations.filter((l) => l.is24HoursDelivery).length;
  const currentlyOpen = locations.filter((l) => l.isOpenNow).length;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg">
              Outlets &amp; Hubs
            </span>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Locations Management</h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Add and update restaurant branches, phone numbers, map coordinates, and operating hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={fetchLocations}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs sm:text-sm font-semibold rounded-2xl transition-all flex items-center gap-2"
            title="Refresh locations"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <motion.button
            id="add-location-btn"
            onClick={openAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:opacity-95 transition-all"
          >
            <span>➕</span>
            <span>Add Location</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── KPI Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Outlets</p>
          <p className="text-white text-2xl font-black mt-1">{totalBranches}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active on Site</p>
          <p className="text-emerald-400 text-2xl font-black mt-1">{activeBranches}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Currently Open</p>
          <p className="text-orange-400 text-2xl font-black mt-1">{currentlyOpen}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">24/7 Delivery Hubs</p>
          <p className="text-purple-400 text-2xl font-black mt-1">{delivery24h}</p>
        </div>
      </div>

      {/* ─── Search & Quick Action Filter ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by branch name, area, phone number, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>
        <Link
          href="/#locations-section"
          target="_blank"
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-orange-400 font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all"
        >
          <span>👀 View Public Map</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ─── Locations List ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="text-center py-20 bg-white/3 border border-white/8 rounded-3xl p-8">
          <div className="text-5xl mb-3">📍</div>
          <p className="text-white font-bold text-lg">No Locations Found</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            {search ? 'No branches match your search query.' : 'Add your first restaurant branch or outlet.'}
          </p>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20"
          >
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc, i) => (
            <motion.div
              key={loc._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`border rounded-3xl p-5 flex flex-col justify-between transition-all ${
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
                    <span
                      onClick={() => handleQuickToggle(loc._id, 'isOpenNow', loc.isOpenNow)}
                      title="Click to toggle Open / Closed status"
                      className={`cursor-pointer px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border transition-all ${
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
                    </span>
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
                  onClick={() => handleQuickToggle(loc._id, 'isActive', loc.isActive)}
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
                    href={loc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${loc.coordinates[0]},${loc.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-colors"
                    title="View on Google Maps"
                  >
                    🗺️
                  </a>
                  <button
                    onClick={() => openEdit(loc)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeletingLocation(loc)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs transition-all"
                    title="Delete location"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {(showAddModal || editingLocation) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-full my-6 sm:my-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {editingLocation ? '✏️ Edit Branch Location' : '➕ Add New Branch Location'}
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Update location details, customer hotline, and map pin coordinates.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingLocation(null);
                  }}
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

              <form onSubmit={editingLocation ? handleUpdate : handleCreate} className="space-y-4">
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
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
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
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Status Toggles & Order */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={formIsOpen}
                      onChange={(e) => setFormIsOpen(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 accent-orange-500"
                    />
                    <span>Open Now</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={formIs24h}
                      onChange={(e) => setFormIs24h(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-500 accent-purple-500"
                    />
                    <span>24/7 Delivery</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
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
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingLocation(null);
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>💾</span>
                    )}
                    <span>{editingLocation ? 'Save Updates' : 'Create Location'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRMATION MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {deletingLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-2xl flex items-center justify-center mx-auto mb-4">
                🗑️
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Delete Location?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">{deletingLocation.name}</strong> ({deletingLocation.area})?
                This branch and its phone number will be removed from the public website and interactive map.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingLocation(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Deleting…' : 'Yes, Delete Branch'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
