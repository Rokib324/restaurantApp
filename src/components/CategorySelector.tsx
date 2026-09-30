'use client';

import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

const CATEGORIES = [
  { id: 'all', label: 'All Items', emoji: '🍽️' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'wraps', label: 'Wraps', emoji: '🌯' },
  { id: 'sides', label: 'Sides', emoji: '🍟' },
  { id: 'drinks', label: 'Drinks', emoji: '🥤' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
];

export default function CategorySelector() {
  const { activeCategory, setActiveCategory } = useCartStore();

  return (
    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
      {CATEGORIES.map((cat, index) => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            id={`category-btn-${cat.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.5 }}
            onClick={() => setActiveCategory(cat.id)}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`
              relative flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm
              transition-all duration-300 border cursor-pointer
              ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-orange-500/40 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
