'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

interface CategoryItem {
  id: string;
  label: string;
  emoji: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
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
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const dynamicCats: CategoryItem[] = [
            { id: 'all', label: 'All Items', emoji: '🍽️' },
            ...data.data.map((cat: { slug: string; name: string; emoji?: string }) => ({
              id: cat.slug,
              label: cat.name,
              emoji: cat.emoji || '🍽️',
            })),
          ];
          if (mounted) {
            setCategories(dynamicCats);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic categories:', err);
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
      {categories.map((cat, index) => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            id={`category-btn-${cat.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={() => setActiveCategory(cat.id)}
            whileHover={{ scale: 1.05, y: -2 }}
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
