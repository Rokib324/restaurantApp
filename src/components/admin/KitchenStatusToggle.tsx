'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings, useSetSiteSettings } from '@/components/providers/SiteSettingsProvider';

interface KitchenStatusToggleProps {
  className?: string;
  compact?: boolean;
}

export default function KitchenStatusToggle({ className = '', compact = false }: KitchenStatusToggleProps) {
  const router = useRouter();
  const site = useSiteSettings();
  const setSiteSettings = useSetSiteSettings();

  const [isOpen, setIsOpen] = useState<boolean>(site.isKitchenOpen ?? true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openLabel = site.kitchenOpenText || 'Kitchens Open Now';
  const closedLabel = site.kitchenClosedText || 'Kitchens are now close';

  const handleToggle = async () => {
    if (loading) return;
    const nextState = !isOpen;

    // Optimistic UI update
    setIsOpen(nextState);
    setSiteSettings((prev) => ({ ...prev, isKitchenOpen: nextState }));
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/kitchen-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isKitchenOpen: nextState }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update kitchen status');
      }

      setFeedback(nextState ? 'Kitchen is now Open!' : 'Kitchen is now Closed!');
      setTimeout(() => setFeedback(null), 3500);
      router.refresh();
    } catch {
      // Revert on error
      setIsOpen(!nextState);
      setSiteSettings((prev) => ({ ...prev, isKitchenOpen: !nextState }));
      setFeedback('Failed to update status. Please try again.');
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  if (compact) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          id="kitchen-status-toggle-compact"
          role="switch"
          aria-checked={isOpen}
          aria-label={`Toggle kitchen status. Currently ${isOpen ? openLabel : closedLabel}`}
          disabled={loading}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 select-none cursor-pointer ${
            isOpen
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/15'
          } ${loading ? 'opacity-70 cursor-wait' : ''}`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="font-medium">{isOpen ? openLabel : closedLabel}</span>
          <span
            className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
              isOpen ? 'bg-emerald-500/40 justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-3 h-3 rounded-full shadow-sm ${
                isOpen ? 'bg-emerald-400' : 'bg-gray-400'
              }`}
            />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-3 ${className}`}>
      <div
        className={`flex items-center justify-between gap-4 p-2 sm:p-2.5 pl-3.5 sm:pl-4 rounded-2xl border transition-all duration-300 ${
          isOpen
            ? 'bg-emerald-950/25 border-emerald-500/25 shadow-lg shadow-emerald-950/30'
            : 'bg-rose-950/25 border-rose-500/25 shadow-lg shadow-rose-950/30'
        }`}
      >
        {/* Status Indicator & Text */}
        <div className="flex items-center gap-3 min-w-[170px]">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-colors ${
              isOpen
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {isOpen ? '👨‍🍳' : '🔒'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isOpen ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isOpen ? 'Kitchen Open' : 'Kitchen Closed'}
              </span>
            </div>
            <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[190px] sm:max-w-none">
              {isOpen ? openLabel : closedLabel}
            </p>
          </div>
        </div>

        {/* Toggle Switch Button */}
        <button
          type="button"
          id="kitchen-status-toggle-btn"
          role="switch"
          aria-checked={isOpen}
          aria-label={`Toggle kitchen status. Currently ${isOpen ? openLabel : closedLabel}`}
          disabled={loading}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          title={isOpen ? 'Click to close kitchen' : 'Click to open kitchen'}
          className={`relative group flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 ${
            isOpen
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-200 focus:ring-emerald-500'
              : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-200 focus:ring-rose-500'
          } ${loading ? 'opacity-60 cursor-wait' : 'active:scale-95'}`}
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
          ) : (
            <span
              className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors ${
                isOpen ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-3.5 h-3.5 rounded-full bg-white shadow"
              />
            </span>
          )}
          <span>{isOpen ? 'Open' : 'Closed'}</span>
        </button>
      </div>

      {/* Floating Status Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-lg ${
              isOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
