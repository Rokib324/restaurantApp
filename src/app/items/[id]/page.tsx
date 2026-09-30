'use client';

import { useState, useEffect } from 'react';
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

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const [item, setItem] = useState<FoodItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [resolvedId, setResolvedId] = useState<string>('');

  const { addItem, updateQuantity: updateCartQty, items: cartItems } = useCartStore();

  useEffect(() => {
    params.then(({ id }) => setResolvedId(id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;

    const fetchItem = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        if (data.success) {
          const found = data.data.find((i: FoodItem) => i._id === resolvedId);
          setItem(found ?? null);
          if (found) {
            const related = data.data
              .filter(
                (i: FoodItem) =>
                  i._id !== resolvedId &&
                  (i.category === found.category ||
                    i.tags.some((t: string) => found.tags.includes(t)))
              )
              .slice(0, 4);
            setRelatedItems(related);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [resolvedId]);

  const handleAddToCart = () => {
    if (!item) return;
    const cartItem: CartItem = {
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      category: item.category,
    };

    const existing = cartItems.find((ci) => ci.id === item._id);
    if (existing) {
      updateCartQty(item._id, existing.quantity + quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(cartItem);
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 container mx-auto px-6 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-white/10 rounded-3xl" />
          <div className="space-y-6 pt-8">
            <div className="h-8 bg-white/10 rounded-full w-3/4" />
            <div className="h-4 bg-white/10 rounded-full w-1/3" />
            <div className="h-24 bg-white/10 rounded-2xl" />
            <div className="h-12 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Item not found</h2>
          <Link href="/" className="text-orange-400 hover:underline">← Back to Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize">{item.category}</span>
          <span>/</span>
          <span className="text-white">{item.name}</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div
              className="relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in bg-gray-900 border border-white/10"
              onMouseEnter={() => setImageZoomed(true)}
              onMouseLeave={() => setImageZoomed(false)}
            >
              <motion.div
                animate={{ scale: imageZoomed ? 1.12 : 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              {/* Zoom hint */}
              <AnimatePresence>
                {!imageZoomed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs"
                  >
                    🔍 Hover to zoom
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-3xl -z-10 blur-xl" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 lg:pt-4"
          >
            {/* Category */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-semibold w-fit capitalize">
              {item.category}
            </span>

            {/* Name & Price */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                {item.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-orange-400">৳{item.price}</span>
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold">
                  ✓ Available
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed">{item.description}</p>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm capitalize font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
                <button
                  id="qty-decrease-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold hover:bg-red-500/30 transition-colors text-lg"
                >
                  −
                </button>
                <span className="text-white font-bold text-xl w-8 text-center">{quantity}</span>
                <button
                  id="qty-increase-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold hover:bg-green-500/30 transition-colors text-lg"
                >
                  +
                </button>
              </div>

              <motion.button
                id="add-to-cart-detail-btn"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  added
                    ? 'bg-green-500 text-white shadow-green-500/30 shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/20 shadow-lg'
                }`}
              >
                {added ? '✓ Added to Cart!' : `🛒 Add ${quantity > 1 ? `${quantity}x` : ''} to Cart`}
              </motion.button>
            </div>

            {/* Total for selection */}
            {quantity > 1 && (
              <p className="text-gray-400 text-sm">
                Total: <span className="text-orange-400 font-bold">৳{item.price * quantity}</span>
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: '🔥', label: 'Fresh Daily' },
                  { icon: '🚴', label: 'Fast Delivery' },
                  { icon: '💯', label: 'Quality Assured' },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-2 p-4 bg-white/3 border border-white/8 rounded-2xl"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-gray-400 text-xs font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <section className="mt-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-extrabold text-white mb-8"
            >
              You Might Also Like
            </motion.h2>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">
              {relatedItems.map((relItem, i) => (
                <motion.div
                  key={relItem._id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-60 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 group"
                >
                  <Link href={`/items/${relItem._id}`}>
                    <div className="relative h-40 overflow-hidden bg-gray-900">
                      <Image
                        src={relItem.imageUrl}
                        alt={relItem.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-400"
                        sizes="240px"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                        {relItem.name}
                      </h3>
                      <span className="text-orange-400 font-extrabold">৳{relItem.price}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
