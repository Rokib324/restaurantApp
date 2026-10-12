'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewItem, DEFAULT_REVIEWS } from '@/data/reviews';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

interface ReviewsSectionProps {
  initialReviews?: ReviewItem[];
}

export default function ReviewsSection({ initialReviews }: ReviewsSectionProps) {
  const site = useSiteSettings();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || DEFAULT_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'google' | 'facebook'>('all');
  const [onlyFiveStars, setOnlyFiveStars] = useState(false);

  // Sync client-side with public API in case admin just updated
  useEffect(() => {
    let isMounted = true;
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data);
        }
      })
      .catch(() => {
        // Fallback to initial or default reviews if network fails
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalReviewsCount = reviews.length;
  const googleCount = reviews.filter((r) => r.platform === 'google').length;
  const facebookCount = reviews.filter((r) => r.platform === 'facebook').length;

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'google' && r.platform !== 'google') return false;
    if (activeFilter === 'facebook' && r.platform !== 'facebook') return false;
    if (onlyFiveStars && r.rating < 5) return false;
    return true;
  });

  const fbUrl = site.facebookUrl || 'https://facebook.com';
  const googleUrl = site.googleReviewUrl || 'https://maps.google.com';
  const instaUrl = site.instagramUrl || 'https://instagram.com';
  const waNumber = site.whatsappNumber || '+880 1711-001122';

  return (
    <section
      id="reviews-section"
      className="relative py-16 sm:py-24 bg-gray-950 border-t border-white/8 overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <span>⭐</span>
            <span>4.9 / 5.0 Rating from 2,500+ Foodies</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Loved by Guests Across Dhaka.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 bg-clip-text text-transparent block sm:inline">
              Real Facebook &amp; Google Reviews
            </span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Honest feedback from our regulars across Gulshan, Banani, Dhanmondi, and Uttara.
            Discover why our smash burgers, pizzas, and rapid delivery are top-rated.
          </p>
        </motion.div>

        {/* Social Media Channels & Trust Cards Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          {/* Google Reviews Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-black text-gray-800 shadow-md">
                  G
                </span>
                <div>
                  <h3 className="text-white font-bold text-sm">Google Reviews</h3>
                  <p className="text-gray-400 text-[11px]">Maps &amp; Local Business</p>
                </div>
              </div>
              <span className="text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                4.9 ★
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Based on <strong className="text-gray-200">1,400+ verified ratings</strong> in Dhaka.
            </p>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Review us on Google</span>
              <span>↗</span>
            </a>
          </div>

          {/* Facebook Page Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-blue-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-base font-bold shadow-md">
                  f
                </span>
                <div>
                  <h3 className="text-white font-bold text-sm">Facebook Page</h3>
                  <p className="text-gray-400 text-[11px]">Official Community Page</p>
                </div>
              </div>
              <span className="text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                98% Positive
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              <strong className="text-gray-200">1,150+ recommendations</strong> from food lovers.
            </p>
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Recommend on Facebook</span>
              <span>↗</span>
            </a>
          </div>

          {/* Instagram Community Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-pink-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  📸
                </span>
                <div>
                  <h3 className="text-white font-bold text-sm">Instagram Foodies</h3>
                  <p className="text-gray-400 text-[11px]">Tag @{site.name.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
              </div>
              <span className="text-pink-400 text-xs font-bold bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/20">
                Stories &amp; Reels
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Share your unboxing reels &amp; burger cheese pulls.
            </p>
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-pink-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Follow our Instagram</span>
              <span>↗</span>
            </a>
          </div>

          {/* WhatsApp / Care Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-emerald-400/30 transition-all flex flex-col justify-between group shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  💬
                </span>
                <div>
                  <h3 className="text-white font-bold text-sm">WhatsApp Care</h3>
                  <p className="text-gray-400 text-[11px]">Direct Support &amp; Hotline</p>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Quick Reply
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Special catering orders or questions? Reach us directly.
            </p>
            <a
              href={`https://wa.me/${waNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Chat on WhatsApp</span>
              <span>↗</span>
            </a>
          </div>
        </motion.div>

        {/* Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-10 pb-4 border-b border-white/8"
        >
          {/* Platform Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/8'
              }`}
            >
              All Reviews ({totalReviewsCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('google')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'google'
                  ? 'bg-amber-500 text-gray-950 font-bold shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/8'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-800">
                G
              </span>
              <span>Google ({googleCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('facebook')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'facebook'
                  ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/8'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white text-[#1877F2] flex items-center justify-center text-[10px] font-bold">
                f
              </span>
              <span>Facebook ({facebookCount})</span>
            </button>
          </div>

          {/* 5-Star Only Filter */}
          <button
            type="button"
            onClick={() => setOnlyFiveStars(!onlyFiveStars)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyFiveStars
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-amber-400">★</span>
            <span>5-Star Only</span>
          </button>
        </motion.div>

        {/* Reviews Cards Grid */}
        <AnimatePresence mode="popLayout">
          {filteredReviews.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            >
              {filteredReviews.map((rev, index) => {
                const isGoogle = rev.platform === 'google';

                return (
                  <motion.div
                    key={rev._id || `${rev.reviewerName}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
                    className="relative bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-orange-500/35 rounded-3xl p-6 sm:p-7 flex flex-col justify-between group shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-500/5"
                  >
                    <div>
                      {/* Top platform bar */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {isGoogle ? (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-900 shadow-sm">
                              G
                            </span>
                            <span>Google Review</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                            <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                              f
                            </span>
                            <span>Facebook Recommendation</span>
                          </div>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <span key={i} className="text-sm drop-shadow-sm">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Reviewer Information */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md">
                          {rev.reviewerImage ? (
                            <Image
                              src={rev.reviewerImage}
                              alt={rev.reviewerName}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : (
                            <span>{rev.reviewerName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-sm sm:text-base truncate flex items-center gap-1.5">
                            <span>{rev.reviewerName}</span>
                            <span
                              className="text-emerald-400 text-xs font-bold shrink-0"
                              title="Verified patron review"
                            >
                              ✓
                            </span>
                          </h3>
                          <p className="text-gray-400 text-xs truncate">
                            {rev.reviewerTitle || 'Verified Patron'}
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            {rev.reviewDate || 'Recently'}
                          </p>
                        </div>
                      </div>

                      {/* Quote Text */}
                      <div className="relative mb-4 pl-3.5 border-l-2 border-orange-500/40">
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic">
                          &ldquo;{rev.reviewText}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Food Mentioned & Source Link */}
                    <div className="pt-3 border-t border-white/8 space-y-2.5">
                      {rev.foodMentioned && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium w-full">
                          <span className="text-base shrink-0">🍔</span>
                          <span className="text-gray-400 shrink-0 font-semibold">Ordered:</span>
                          <span className="text-orange-200 truncate">{rev.foodMentioned}</span>
                        </div>
                      )}

                      {rev.sourceUrl && (
                        <div className="flex items-center justify-end">
                          <a
                            href={rev.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-300 transition-colors"
                          >
                            <span>View original review</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="py-12 text-center bg-white/2 border border-white/8 rounded-3xl p-8">
              <p className="text-gray-400 text-sm">
                No reviews found matching this filter.
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Call to Action strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-red-500/5 to-purple-500/10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
        >
          <div>
            <h3 className="text-white font-extrabold text-lg sm:text-xl mb-1">
              Dined With Us or Ordered Today?
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm max-w-xl">
              Your feedback fuels our kitchens! Drop us a quick review on Facebook or Google Maps and help fellow Dhaka food lovers discover bold flavors.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-900">
                G
              </span>
              <span>Review on Google</span>
            </a>

            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <span>f</span>
              <span>Post on Facebook</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
