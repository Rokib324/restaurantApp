'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { splitBrandName } from '@/config/site';
import { RestaurantLocation } from '@/data/locations';

export default function Footer() {
  const site = useSiteSettings();
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const currentYear = new Date().getFullYear();
  const [nameStart, nameHighlight, nameEnd] = splitBrandName(site.name, site.nameHighlight);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setLocations(d.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const primaryPhone = locations[0]?.phone || '+880 1711-001122';

  return (
    <>
      <footer className="relative bg-gray-950 text-gray-400 border-t border-white/10 overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Main Restaurant Footer ────────────────────────────────────────── */}
        <div className="container mx-auto px-6 lg:px-12 pt-16 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Col 1: Brand & Bio (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-11 h-11 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                  <BrandLogo size={28} />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight block">
                    {nameStart}
                    {nameHighlight && <span className="text-orange-400">{nameHighlight}</span>}
                    {nameEnd}
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold block">
                    {site.tagline}
                  </span>
                </div>
              </Link>

              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Dhaka&apos;s favorite destination for artisan smash burgers, freshly baked pizzas,
                crispy kathi rolls, and traditional refreshments. Prepared with passion and delivered hot within 30 minutes.
              </p>

              {/* Status & Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Kitchens Open Now</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium">
                  <span>✨</span>
                  <span>100% Halal Certified</span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Explore Menu
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">
                    Smash Burgers
                  </Link>
                </li>
                <li>
                  <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">
                    Artisan Pizzas
                  </Link>
                </li>
                <li>
                  <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">
                    Kathi Rolls & Wraps
                  </Link>
                </li>
                <li>
                  <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">
                    Crispy Sides & Fries
                  </Link>
                </li>
                <li>
                  <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">
                    Desi Sharbats & Lassi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Dhaka Hub Locations (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Dhaka Hubs & Hours
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <li key={loc.id || loc.slug} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">📍</span>
                      <div>
                        <strong className="text-white">{loc.name}</strong>{' '}
                        <span className="text-gray-400 text-[11px]">({loc.hours})</span>
                        <p className="text-gray-500 text-[11px] truncate max-w-[220px]">
                          {loc.address}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">📍</span>
                      <div>
                        <strong className="text-white">Gulshan 2 Flagship</strong> (24/7 Delivery)
                        <p className="text-gray-500 text-[11px]">Plot 12, Road 71, Gulshan 2</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">📍</span>
                      <div>
                        <strong className="text-white">Dhanmondi Hub</strong> (11am – 12am)
                        <p className="text-gray-500 text-[11px]">Satmasjid Road (Near Dhanmondi 27)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">📍</span>
                      <div>
                        <strong className="text-white">Banani 11 & Uttara Hubs</strong>
                        <p className="text-gray-500 text-[11px]">Road 11, Banani & Sector 7, Uttara</p>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              <Link
                href="/#locations-section"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors pt-1"
              >
                <span>View Interactive Dhaka Map</span>
                <span>↗</span>
              </Link>
            </div>

            {/* Col 4: Hotline & Payments (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Customer Care & Orders
              </h4>
              <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-400 font-medium">Order Hotline (10am – 2am):</p>
                <a
                  href={`tel:${primaryPhone}`}
                  className="text-base font-extrabold text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  <span className="text-orange-400">📞</span>
                  <span>{primaryPhone}</span>
                </a>
                <p className="text-[11px] text-gray-500 pt-1">
                  Average delivery speed: 25–35 minutes across Dhaka metro.
                </p>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Accepted Payments:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-pink-400">
                    💳 bKash
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-orange-400">
                    💰 Nagad
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-emerald-400">
                    💵 Cash on Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Left (Copyright), Middle (Developer), Right (Links) in a single row */}
          <div className="mt-12 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            {/* Left side: Copyright */}
            <p className="text-center md:text-left">
              © {currentYear} {site.legalName} All rights reserved.
            </p>

            {/* Middle: Developer Signature */}
            <p className="text-center">
              Designed & Engineered by{' '}
              <Link
                href="https://rokibulislam.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 font-medium transition-colors"
              >
                Rokibul Islam
              </Link>
            </p>

            {/* Right side: Navigation & Portfolio Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-5">
              <Link href="/#menu-section" className="hover:text-gray-300 transition-colors">
                Menu
              </Link>
              <Link href="/#locations-section" className="hover:text-gray-300 transition-colors">
                Locations
              </Link>
              <Link href="/admin/login" className="hover:text-gray-300 transition-colors">
                Staff & Admin Portal
              </Link>
              <Link
                href="https://rokibulislam.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                Portfolio
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
