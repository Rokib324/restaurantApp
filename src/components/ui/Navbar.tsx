'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import CartSidebar from '../CartSidebar';
import BrandLogo from './BrandLogo';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

export default function Navbar() {
  const site = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const toggleCart = useCartStore((s) => s.toggleCart);

  // Close mobile menu on resize to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl shrink-0"
          >
            <BrandLogo size={32} className="text-2xl" />
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
              {site.name}
            </span>
          </Link>

          {/* Desktop & Tablet-Landscape Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/#menu-section" className="hover:text-orange-400 transition-colors py-1">
              Menu
            </Link>
            <Link
              href="/#locations-section"
              className="hover:text-orange-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <span>📍</span>
              <span>Locations</span>
            </Link>
            <Link href="/checkout" className="hover:text-orange-400 transition-colors py-1">
              Checkout
            </Link>
            <a href="tel:+8801XXXXXXXXX" className="hover:text-orange-400 transition-colors py-1">
              📞 Order by Phone
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <motion.button
              id="cart-toggle-btn"
              onClick={toggleCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`View cart with ${totalItems} items`}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-orange-400 font-semibold hover:bg-orange-500/20 transition-all duration-200 text-sm"
            >
              <span className="text-base">🛒</span>
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-md shadow-orange-500/40"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile / Tablet Hamburger Toggle Button */}
            <motion.button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="w-5 h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-0.5 bg-current rounded-full"
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 top-16 bg-black/70 backdrop-blur-md z-40 md:hidden"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed top-16 left-0 right-0 bg-gray-950/95 border-b border-white/10 backdrop-blur-2xl z-40 md:hidden px-6 py-6 shadow-2xl flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <Link
                    href="/#menu-section"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-200 hover:text-orange-400 hover:bg-orange-500/10 transition-colors text-base font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <span>🍔</span>
                      <span>Explore Menu</span>
                    </span>
                    <span className="text-gray-500 text-sm">→</span>
                  </Link>

                  <Link
                    href="/#locations-section"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-200 hover:text-orange-400 hover:bg-orange-500/10 transition-colors text-base font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <span>📍</span>
                      <span>Find Dhaka Hubs</span>
                    </span>
                    <span className="text-gray-500 text-sm">→</span>
                  </Link>

                  <Link
                    href="/checkout"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-200 hover:text-orange-400 hover:bg-orange-500/10 transition-colors text-base font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <span>💳</span>
                      <span>Checkout</span>
                    </span>
                    <span className="text-gray-500 text-sm">→</span>
                  </Link>

                  <a
                    href="tel:+8801XXXXXXXXX"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-base font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <span>📞</span>
                      <span>Order by Phone</span>
                    </span>
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
                      Hotline
                    </span>
                  </a>
                </div>

                {/* Quick Info & Portal */}
                <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>🚀 25–35 min Dhaka delivery</span>
                  <Link
                    href="/admin/login"
                    onClick={closeMobileMenu}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Staff Portal →
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
      <CartSidebar />
    </>
  );
}
