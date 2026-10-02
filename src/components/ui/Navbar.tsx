'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import CartSidebar from '../CartSidebar';

export default function Navbar() {
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl">
            <span className="text-2xl">🍔</span>
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              FoodieExpress
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/#menu-section" className="hover:text-orange-400 transition-colors">Menu</Link>
            <Link href="/#locations-section" className="hover:text-orange-400 transition-colors flex items-center gap-1">
              <span>📍</span> Locations
            </Link>
            <Link href="/checkout" className="hover:text-orange-400 transition-colors">Checkout</Link>
            <a href="tel:+8801XXXXXXXXX" className="hover:text-orange-400 transition-colors">📞 Order by Phone</a>
          </div>

          {/* Cart Button */}
          <motion.button
            id="cart-toggle-btn"
            onClick={toggleCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-orange-400 font-semibold hover:bg-orange-500/20 transition-all duration-200"
          >
            🛒
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>
      <CartSidebar />
    </>
  );
}
