'use client';

import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import Link from 'next/link';
import LocationCard, { LocationItem } from './LocationCard';
import LocationFormModal from './LocationFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface AdminLocationsClientProps {
  initialLocations: LocationItem[];
}

export default function AdminLocationsClient({
  initialLocations,
}: AdminLocationsClientProps) {
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    location: LocationItem | null;
  }>({
    isOpen: false,
    location: null,
  });

  const [deletingLocation, setDeletingLocation] = useState<LocationItem | null>(null);

  // Refresh locations from server API
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh locations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Quick toggle active / open / delivery status with optimistic UI update
  const handleQuickToggle = useCallback(
    async (
      id: string,
      field: 'isActive' | 'isOpenNow' | 'is24HoursDelivery',
      currentVal: boolean
    ) => {
      // Optimistic update
      setLocations((prev) =>
        prev.map((loc) => (loc._id === id ? { ...loc, [field]: !currentVal } : loc))
      );

      try {
        const res = await fetch('/api/admin/locations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, [field]: !currentVal }),
        });
        const data = await res.json();
        if (!data.success) {
          // Rollback on failure
          setLocations((prev) =>
            prev.map((loc) => (loc._id === id ? { ...loc, [field]: currentVal } : loc))
          );
        }
      } catch (err) {
        console.error('Quick toggle error:', err);
        // Rollback on network error
        setLocations((prev) =>
          prev.map((loc) => (loc._id === id ? { ...loc, [field]: currentVal } : loc))
        );
      }
    },
    []
  );

  const handleEdit = useCallback((loc: LocationItem) => {
    setModalState({ isOpen: true, location: loc });
  }, []);

  const handleDeletePrompt = useCallback((loc: LocationItem) => {
    setDeletingLocation(loc);
  }, []);

  const handleModalSuccess = useCallback((saved: LocationItem) => {
    setLocations((prev) => {
      const idx = prev.findIndex((l) => l._id === saved._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
    setModalState({ isOpen: false, location: null });
  }, []);

  const handleDeleteSuccess = useCallback((deletedId: string) => {
    setLocations((prev) => prev.filter((l) => l._id !== deletedId));
    setDeletingLocation(null);
  }, []);

  // Filtered locations with deferred search value (non-blocking)
  const filteredLocations = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.area.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.phone.toLowerCase().includes(q)
      );
    });
  }, [locations, deferredSearch]);

  // KPI stats memoized
  const stats = useMemo(() => {
    return {
      total: locations.length,
      active: locations.filter((l) => l.isActive).length,
      open: locations.filter((l) => l.isOpenNow).length,
      delivery24h: locations.filter((l) => l.is24HoursDelivery).length,
    };
  }, [locations]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg">
              Outlets &amp; Hubs
            </span>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
            Locations Management
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Add and update restaurant branches, phone numbers, map coordinates, and operating hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs sm:text-sm font-semibold rounded-2xl transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Refresh locations"
          >
            <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            id="add-location-btn"
            onClick={() => setModalState({ isOpen: true, location: null })}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <span>➕</span>
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Outlets</p>
          <p className="text-white text-2xl font-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active on Site</p>
          <p className="text-emerald-400 text-2xl font-black mt-1">{stats.active}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Currently Open</p>
          <p className="text-orange-400 text-2xl font-black mt-1">{stats.open}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">24/7 Delivery Hubs</p>
          <p className="text-purple-400 text-2xl font-black mt-1">{stats.delivery24h}</p>
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
            className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-1"
            >
              Clear
            </button>
          )}
        </div>
        <Link
          href="/#locations-section"
          target="_blank"
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-orange-400 font-semibold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>👀 View Public Map</span>
          <span>↗</span>
        </Link>
      </div>

      {/* ─── Locations List ──────────────────────────────────────────────── */}
      {filteredLocations.length === 0 ? (
        <div className="text-center py-20 bg-white/3 border border-white/8 rounded-3xl p-8">
          <div className="text-5xl mb-3">📍</div>
          <p className="text-white font-bold text-lg">No Locations Found</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            {search ? 'No branches match your search query.' : 'Add your first restaurant branch or outlet.'}
          </p>
          <button
            type="button"
            onClick={() => setModalState({ isOpen: true, location: null })}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"
          >
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc) => (
            <LocationCard
              key={loc._id}
              loc={loc}
              onQuickToggle={handleQuickToggle}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────────────── */}
      {modalState.isOpen && (
        <LocationFormModal
          location={modalState.location}
          defaultOrder={locations.length + 1}
          onClose={() => setModalState({ isOpen: false, location: null })}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* ─── DELETE CONFIRMATION MODAL ───────────────────────────────────── */}
      {deletingLocation && (
        <DeleteConfirmModal
          location={deletingLocation}
          onClose={() => setDeletingLocation(null)}
          onDeleted={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
