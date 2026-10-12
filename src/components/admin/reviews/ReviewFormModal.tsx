'use client';

import React, { useState } from 'react';
import { ReviewItem } from '@/data/reviews';
import ImageUploadZone from '@/components/admin/ImageUploadZone';
import Image from 'next/image';

interface ReviewFormModalProps {
  review: ReviewItem | null; // null for Create, ReviewItem for Edit
  onClose: () => void;
  onSuccess: (saved: ReviewItem) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

const SUGGESTED_FOODS = [
  'Double Beef Smash Burger',
  'Truffle Mushroom Pizza',
  'Smoky Chicken Kathi Roll',
  'Peri-Peri Loaded Fries',
  'Naga Fire Wings',
  'Desi Borhani',
];

export default function ReviewFormModal({
  review,
  onClose,
  onSuccess,
}: ReviewFormModalProps) {
  const isEditing = !!review && !!review._id;

  const [reviewerName, setReviewerName] = useState(review?.reviewerName || '');
  const [reviewerTitle, setReviewerTitle] = useState(
    review?.reviewerTitle || 'Verified Customer'
  );
  const [reviewerImage, setReviewerImage] = useState(review?.reviewerImage || '');
  const [platform, setPlatform] = useState<'facebook' | 'google'>(
    review?.platform || 'google'
  );
  const [rating, setRating] = useState<number>(review?.rating ?? 5);
  const [reviewText, setReviewText] = useState(review?.reviewText || '');
  const [foodMentioned, setFoodMentioned] = useState(review?.foodMentioned || '');
  const [sourceUrl, setSourceUrl] = useState(review?.sourceUrl || '');
  const [reviewDate, setReviewDate] = useState(review?.reviewDate || 'Recently');
  const [isFeatured, setIsFeatured] = useState<boolean>(review?.isFeatured ?? true);
  const [isActive, setIsActive] = useState<boolean>(review?.isActive ?? true);
  const [order, setOrder] = useState<number>(review?.order ?? 0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setErrorMsg('Please enter the reviewer name.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg('Please enter the actual review text.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      id: review?._id,
      reviewerName: reviewerName.trim(),
      reviewerTitle: reviewerTitle.trim(),
      reviewerImage: reviewerImage.trim(),
      platform,
      rating,
      reviewText: reviewText.trim(),
      foodMentioned: foodMentioned.trim(),
      sourceUrl: sourceUrl.trim(),
      reviewDate: reviewDate.trim(),
      isFeatured,
      isActive,
      order: Number(order) || 0,
    };

    try {
      const url = '/api/admin/reviews';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save review');
      }

      onSuccess(data.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving review');
      setSubmitting(false);
    }
  };

  const handleAddFoodSuggestion = (dish: string) => {
    if (!foodMentioned) {
      setFoodMentioned(dish);
    } else if (!foodMentioned.includes(dish)) {
      setFoodMentioned(`${foodMentioned}, ${dish}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl my-8 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
              {isEditing ? '✏️' : '⭐'}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                {isEditing ? 'Edit Customer Review' : 'Add New Customer Review'}
              </h2>
              <p className="text-gray-400 text-xs">
                Featured reviews displayed on the website from Google and Facebook.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Review Source Platform *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('google')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border transition-all text-sm font-semibold cursor-pointer ${
                  platform === 'google'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800 shadow-sm">
                  G
                </span>
                <span>Google Review</span>
                {platform === 'google' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 ml-auto" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPlatform('facebook')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border transition-all text-sm font-semibold cursor-pointer ${
                  platform === 'facebook'
                    ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  f
                </span>
                <span>Facebook Recommendation</span>
                {platform === 'facebook' && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Star Rating *
              </label>
              <span className="text-amber-400 font-bold text-xs">
                {rating} / 5 Stars
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                    star <= rating ? 'text-amber-400' : 'text-gray-600'
                  }`}
                  aria-label={`${star} Stars`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-3">
                {rating === 5
                  ? '⭐⭐⭐⭐⭐ Exceptional (5.0)'
                  : rating === 4
                  ? '⭐⭐⭐⭐ Great (4.0)'
                  : `${rating} Stars`}
              </span>
            </div>
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Reviewer Name *
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Reviewer Title / Badge
              </label>
              <input
                type="text"
                value={reviewerTitle}
                onChange={(e) => setReviewerTitle(e.target.value)}
                placeholder="e.g. Level 6 Google Guide or Food Blogger"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          {/* Reviewer Image & Avatar Presets */}
          <div className="space-y-3">
            <ImageUploadZone
              value={reviewerImage}
              onChange={(url) => setReviewerImage(url)}
              label="Reviewer Photo / Avatar"
            />
            {/* Quick avatar presets */}
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                Or pick from quick avatar presets:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewerImage(avatar)}
                    className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      reviewerImage === avatar
                        ? 'border-orange-500 ring-2 ring-orange-500/40'
                        : 'border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={avatar}
                      alt={`Avatar preset ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="36px"
                      unoptimized
                    />
                  </button>
                ))}
                {reviewerImage && (
                  <button
                    type="button"
                    onClick={() => setReviewerImage('')}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg border border-white/10"
                  >
                    Clear Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actual Review Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Actual Review / Comment *
              </label>
              <span className="text-[11px] text-gray-500">
                {reviewText.length} characters
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Paste or write the customer's exact words praising the food, delivery, taste, or service..."
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 leading-relaxed"
            />
          </div>

          {/* Food Mentioned (Highlighted in Review) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Food They Mentioned (Optional)
            </label>
            <input
              type="text"
              value={foodMentioned}
              onChange={(e) => setFoodMentioned(e.target.value)}
              placeholder="e.g. Double Beef Smash Burger, Truffle Fries, Naga Wings"
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-gray-500 mr-1">Quick add:</span>
              {SUGGESTED_FOODS.map((food) => (
                <button
                  key={food}
                  type="button"
                  onClick={() => handleAddFoodSuggestion(food)}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 border border-white/10 text-[11px] text-gray-400 transition-colors"
                >
                  + {food}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Source URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Review Date / Time
              </label>
              <input
                type="text"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                placeholder="e.g. 2 days ago, Yesterday, or Oct 2026"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Original Post / Map Link (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://maps.google.com/... or Facebook URL"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          {/* Display & Order Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="modal-is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/30 border-white/20 bg-gray-800 cursor-pointer"
              />
              <label
                htmlFor="modal-is-active"
                className="text-xs font-semibold text-gray-300 cursor-pointer"
              >
                Visible on Website
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="modal-is-featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/30 border-white/20 bg-gray-800 cursor-pointer"
              />
              <label
                htmlFor="modal-is-featured"
                className="text-xs font-semibold text-gray-300 cursor-pointer"
              >
                Featured Card
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Review…</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Publish Review'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
