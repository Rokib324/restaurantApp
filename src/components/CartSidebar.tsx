'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

export default function CartSidebar() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, getTotalAmount } =
    useCartStore();
  const totalAmount = getTotalAmount();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gray-950 border-l border-white/10 flex flex-col shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                <span>🛒</span>
                <span>Your Cart</span>
                {items.length > 0 && (
                  <span className="text-xs sm:text-sm font-normal text-gray-400">
                    ({items.length} item{items.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              <button
                id="close-cart-btn"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-60 text-center px-4"
                  >
                    <div className="text-5xl sm:text-6xl mb-3">🍽️</div>
                    <p className="text-gray-300 text-base sm:text-lg font-medium">Your cart is empty</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Add some delicious items from our menu!</p>
                    <button
                      onClick={closeCart}
                      className="mt-4 px-6 py-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl font-semibold text-xs sm:text-sm hover:bg-orange-500/20 transition-all cursor-pointer"
                    >
                      Browse Menu
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4"
                    >
                      {/* Image */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 border border-white/5">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={item.imageUrl.startsWith('/uploads/')}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="text-white font-semibold text-xs sm:text-sm truncate">{item.name}</p>
                        <p className="text-orange-400 font-bold text-xs sm:text-sm mt-0.5">৳{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-red-500/30 transition-colors text-sm font-bold active:scale-95"
                        >
                          −
                        </button>
                        <span className="text-white font-bold text-xs sm:text-sm w-4 sm:w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.name}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-green-500/30 transition-colors text-sm font-bold active:scale-95"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors text-xs ml-0.5 active:scale-95"
                        >
                          🗑
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 space-y-3 sm:space-y-4 bg-gray-950/80">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-bold">৳{totalAmount}</span>
                </div>
                {totalAmount >= 300 && (
                  <div className="flex items-center gap-1.5 text-green-400 text-xs sm:text-sm font-medium">
                    <span>✓</span>
                    <span>Free delivery applied!</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-base sm:text-lg">Total</span>
                  <span className="text-orange-400 font-extrabold text-xl sm:text-2xl">
                    ৳{totalAmount < 300 ? totalAmount + 40 : totalAmount}
                  </span>
                </div>
                {totalAmount < 300 && (
                  <p className="text-gray-500 text-[11px] sm:text-xs">+ ৳40 delivery charge for orders under ৳300</p>
                )}

                <Link href="/checkout" onClick={closeCart} className="block pt-1">
                  <motion.button
                    id="proceed-to-checkout-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300"
                  >
                    Proceed to Checkout →
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
