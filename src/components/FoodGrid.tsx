'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/lib/store';

interface FoodItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard = memo(function FoodCard({ item }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartQty = useCartStore(
    (s) => s.items.find((ci) => ci.id === item._id)?.quantity ?? 0
  );
  const [imageHovered, setImageHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const cartItem: CartItem = {
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      category: item.category,
    };
    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
    >
      <Link href={`/items/${item._id}`} className="block">
        {/* Image container */}
        <div
          className="relative h-44 xs:h-48 sm:h-52 overflow-hidden bg-gray-900"
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={() => setImageHovered(false)}
        >
          <motion.div
            animate={{ scale: imageHovered ? 1.08 : 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              unoptimized={item.imageUrl.startsWith('/uploads/')}
            />
          </motion.div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Category badge */}
          <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 border border-white/20 rounded-full text-white text-xs font-medium capitalize">
            {item.category}
          </span>

          {/* Cart qty badge */}
          {cartQty > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md shadow-orange-500/40"
            >
              {cartQty}
            </motion.span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-bold text-sm sm:text-base leading-tight group-hover:text-orange-400 transition-colors duration-200">
              {item.name}
            </h3>
            <span className="text-orange-400 font-extrabold text-base sm:text-lg whitespace-nowrap shrink-0">
              ৳{item.price}
            </span>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3.5 sm:mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[11px] sm:text-xs capitalize"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <motion.button
          id={`add-to-cart-${item._id}`}
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
            added
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40'
          }`}
        >
          {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
});

interface FoodGridProps {
  activeCategory: string;
}

export default function FoodGrid({ activeCategory }: FoodGridProps) {
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all items once on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setAllItems(data.data);
          } else {
            setError(data.error ?? 'Failed to load items');
          }
        }
      } catch {
        if (isMounted) {
          setError('Network error. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Instant in-memory filtering (0ms latency, zero re-fetching)
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return allItems;
    return allItems.filter(
      (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [allItems, activeCategory]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-pulse"
          >
            <div className="h-44 xs:h-48 sm:h-52 bg-white/10" />
            <div className="p-4 sm:p-5 space-y-3">
              <div className="h-4 bg-white/10 rounded-full w-3/4" />
              <div className="h-3 bg-white/10 rounded-full w-full" />
              <div className="h-3 bg-white/10 rounded-full w-2/3" />
              <div className="h-10 bg-white/10 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 sm:py-20 px-4">
        <div className="text-4xl sm:text-5xl mb-4">⚠️</div>
        <p className="text-red-400 text-base sm:text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 px-4">
        <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
        <p className="text-gray-400 text-base sm:text-lg">No items found in this category.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={activeCategory}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        {filteredItems.map((item) => (
          <FoodCard key={item._id} item={item} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
