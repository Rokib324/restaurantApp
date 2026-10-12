'use client';

import React from 'react';
import Image from 'next/image';
import { ReviewItem } from '@/data/reviews';

interface ReviewCardProps {
  review: ReviewItem;
  onEdit: (review: ReviewItem) => void;
  onDeletePrompt: (review: ReviewItem) => void;
  onQuickToggle: (
    id: string,
    field: 'isActive' | 'isFeatured',
    currentVal: boolean
  ) => void;
}

export default function ReviewCard({
  review,
  onEdit,
  onDeletePrompt,
  onQuickToggle,
}: ReviewCardProps) {
  const isGoogle = review.platform === 'google';

  return (
    <div
      className={`relative bg-gray-900/90 border rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-xl ${
        review.isActive
          ? 'border-white/10 hover:border-orange-500/40 hover:bg-gray-900'
          : 'border-white/5 bg-gray-900/40 opacity-70'
      }`}
    >
      <div>
        {/* Top Header Row: Platform badge + Stars + Quick toggles */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {isGoogle ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-800">
                  G
                </span>
                <span>Google Review</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold">
                  f
                </span>
                <span>Facebook Recommendation</span>
              </span>
            )}

            {review.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-semibold">
                ✨ Featured
              </span>
            )}
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/8 shrink-0">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-white text-xs font-bold">{review.rating}.0</span>
          </div>
        </div>

        {/* Reviewer Profile */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
            {review.reviewerImage ? (
              <Image
                src={review.reviewerImage}
                alt={review.reviewerName}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <span>{review.reviewerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-bold text-sm truncate flex items-center gap-1.5">
              <span>{review.reviewerName}</span>
              <span className="text-emerald-400 text-xs" title="Verified Review">
                ✓
              </span>
            </h3>
            <p className="text-gray-400 text-xs truncate">
              {review.reviewerTitle || 'Verified Patron'}
            </p>
            <p className="text-gray-500 text-[11px] mt-0.5">
              {review.reviewDate || 'Recently'}
            </p>
          </div>
        </div>

        {/* Review Body */}
        <div className="relative mb-3.5 pl-3 border-l-2 border-white/10">
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic line-clamp-4">
            &ldquo;{review.reviewText}&rdquo;
          </p>
        </div>

        {/* Food Mentioned Tag */}
        {review.foodMentioned && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium">
            <span className="text-sm">🍽️</span>
            <span className="font-semibold text-orange-200">Ordered:</span>
            <span className="truncate max-w-[220px]">{review.foodMentioned}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Action Buttons & Visibility Switch */}
      <div className="pt-4 border-t border-white/8 flex items-center justify-between gap-2 mt-2">
        {/* Visibility switch */}
        <button
          type="button"
          onClick={() => {
            if (review._id) onQuickToggle(review._id, 'isActive', review.isActive);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            review.isActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
          }`}
          title="Click to toggle website visibility"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              review.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span>{review.isActive ? 'Visible on site' : 'Hidden'}</span>
        </button>

        {/* Edit & Delete actions */}
        <div className="flex items-center gap-1.5">
          {review.sourceUrl && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors"
              title="Open source review"
            >
              ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <span>✏️</span>
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDeletePrompt(review)}
            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center text-xs transition-colors"
            title="Delete Review"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
