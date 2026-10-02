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
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                🛒 Your Cart
                {items.length > 0 && (
                  <span className="text-sm font-normal text-gray-400">
                    ({items.length} item{items.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              <button
                id="close-cart-btn"
                onClick={closeCart}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-60 text-center"
                  >
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-400 text-lg font-medium">Your cart is empty</p>
                    <p className="text-gray-500 text-sm mt-2">Add some delicious items!</p>
                    <button
                      onClick={closeCart}
                      className="mt-4 px-6 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl font-semibold text-sm hover:bg-orange-500/20 transition-all"
                    >
                      Browse Menu
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-orange-400 font-bold text-sm">৳{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-red-500/30 transition-colors text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="text-white font-bold text-sm w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-green-500/30 transition-colors text-sm font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors text-xs ml-1"
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
              <div className="p-6 border-t border-white/10 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-bold">৳{totalAmount}</span>
                </div>
                {totalAmount >= 300 && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span>
                    <span>Free delivery applied!</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-orange-400 font-extrabold text-2xl">
                    ৳{totalAmount < 300 ? totalAmount + 40 : totalAmount}
                  </span>
                </div>
                {totalAmount < 300 && (
                  <p className="text-gray-500 text-xs">+ ৳40 delivery charge</p>
                )}

                <Link href="/checkout" onClick={closeCart}>
                  <motion.button
                    id="proceed-to-checkout-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300"
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
