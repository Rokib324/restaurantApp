'use client';

import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import Link from 'next/link';
import { ReviewItem } from '@/data/reviews';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import DeleteReviewModal from './DeleteReviewModal';

interface AdminReviewsClientProps {
  initialReviews: ReviewItem[];
}

export default function AdminReviewsClient({
  initialReviews,
}: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [filterPlatform, setFilterPlatform] = useState<
    'all' | 'google' | 'facebook' | 'hidden'
  >('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    review: ReviewItem | null;
  }>({
    isOpen: false,
    review: null,
  });

  const [deletingReview, setDeletingReview] = useState<ReviewItem | null>(null);

  // Refresh reviews from server API
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh reviews:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Quick toggle active / featured status with optimistic update
  const handleQuickToggle = useCallback(
    async (id: string, field: 'isActive' | 'isFeatured', currentVal: boolean) => {
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, [field]: !currentVal } : r))
      );

      try {
        const res = await fetch('/api/admin/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, [field]: !currentVal }),
        });
        const data = await res.json();
        if (!data.success) {
          // Rollback on failure
          setReviews((prev) =>
            prev.map((r) => (r._id === id ? { ...r, [field]: currentVal } : r))
          );
        }
      } catch (err) {
        console.error('Quick toggle error:', err);
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, [field]: currentVal } : r))
        );
      }
    },
    []
  );

  const handleEdit = useCallback((rev: ReviewItem) => {
    setFormModalState({ isOpen: true, review: rev });
  }, []);

  const handleDeletePrompt = useCallback((rev: ReviewItem) => {
    setDeletingReview(rev);
  }, []);

  const handleModalSuccess = useCallback((saved: ReviewItem) => {
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r._id === saved._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    setFormModalState({ isOpen: false, review: null });
  }, []);

  const handleDeletedSuccess = useCallback((id: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== id));
    setDeletingReview(null);
  }, []);

  // Stats calculations
  const totalCount = reviews.length;
  const googleCount = reviews.filter((r) => r.platform === 'google').length;
  const facebookCount = reviews.filter((r) => r.platform === 'facebook').length;
  const activeCount = reviews.filter((r) => r.isActive).length;
  const avgRating = totalCount
    ? (
        reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount
      ).toFixed(1)
    : '5.0';

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Platform filter
      if (filterPlatform === 'google' && rev.platform !== 'google') return false;
      if (filterPlatform === 'facebook' && rev.platform !== 'facebook') return false;
      if (filterPlatform === 'hidden' && rev.isActive !== false) return false;

      // Text search
      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();
      return (
        rev.reviewerName.toLowerCase().includes(q) ||
        rev.reviewerTitle?.toLowerCase().includes(q) ||
        rev.reviewText.toLowerCase().includes(q) ||
        rev.foodMentioned?.toLowerCase().includes(q)
      );
    });
  }, [reviews, filterPlatform, deferredSearch]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              ⭐ Social Proof & Testimonials
            </span>
            <span className="text-gray-500 text-xs">· Dynamic Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
            Curate top reviews from your official Facebook page and Google Maps profile.
            Updates appear live on the website right before the footer.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Refresh list"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <Link
            href="/#reviews-section"
            target="_blank"
            className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>🌐</span>
            <span className="hidden xs:inline">Preview On Site</span>
          </Link>

          <button
            type="button"
            id="add-review-btn"
            onClick={() => setFormModalState({ isOpen: true, review: null })}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Total Reviews
            </span>
            <span className="text-xl">💬</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>●</span> {activeCount} live on website
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
              Google Reviews
            </span>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800">
              G
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{googleCount}</p>
          <p className="text-[11px] text-amber-300/80 mt-1">Verified Google ratings</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-blue-600/10 border border-blue-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
              Facebook
            </span>
            <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold">
              f
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{facebookCount}</p>
          <p className="text-[11px] text-blue-300/80 mt-1">Recommendations & posts</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Average Rating
            </span>
            <span className="text-amber-400 text-lg">⭐</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{avgRating}</p>
            <span className="text-xs text-gray-400 font-semibold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Exceptional customer satisfaction</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/3 border border-white/8 rounded-2xl p-2.5 sm:p-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reviewer name, dish ordered, or comment..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'google', label: `Google (${googleCount})` },
            { key: 'facebook', label: `Facebook (${facebookCount})` },
            { key: 'hidden', label: `Hidden (${totalCount - activeCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterPlatform(tab.key as typeof filterPlatform)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterPlatform === tab.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredReviews.map((rev) => (
            <ReviewCard
              key={rev._id || `${rev.reviewerName}-${rev.platform}`}
              review={rev}
              onEdit={handleEdit}
              onDeletePrompt={handleDeletePrompt}
              onQuickToggle={handleQuickToggle}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/3 border border-white/8 rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto mb-3">
            ⭐
          </div>
          <h3 className="text-white font-bold text-base mb-1">No reviews found</h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-5">
            {search
              ? `No reviews matched "${search}". Try adjusting your search keyword or platform filter.`
              : 'Start by adding your first positive review from Google Maps or your Facebook page!'}
          </p>
          <button
            type="button"
            onClick={() => setFormModalState({ isOpen: true, review: null })}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            + Add New Review
          </button>
        </div>
      )}

      {/* Modals */}
      {formModalState.isOpen && (
        <ReviewFormModal
          review={formModalState.review}
          onClose={() => setFormModalState({ isOpen: false, review: null })}
          onSuccess={handleModalSuccess}
        />
      )}

      {deletingReview && (
        <DeleteReviewModal
          review={deletingReview}
          onClose={() => setDeletingReview(null)}
          onDeleted={handleDeletedSuccess}
        />
      )}
    </div>
  );
}
