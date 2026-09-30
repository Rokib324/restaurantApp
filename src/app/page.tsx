'use client';

import { useCartStore } from '@/lib/store';
import Hero from '@/components/Hero';
import CategorySelector from '@/components/CategorySelector';
import FoodGrid from '@/components/FoodGrid';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { activeCategory } = useCartStore();

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Menu Section */}
      <section
        id="menu-section"
        className="container mx-auto px-6 lg:px-12 py-20"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
            Explore Our Menu
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mt-3 mb-4">
            What&apos;s
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {' '}Cooking Today?
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Fresh ingredients, bold flavors, fast delivery. Order your favorite
            meals and pay the way you like.
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <CategorySelector />
        </motion.div>

        {/* Food Grid */}
        <FoodGrid activeCategory={activeCategory} />
      </section>

      {/* Why Choose Us */}
      <section className="bg-white/2 border-y border-white/5 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white">
              Why{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                FoodieExpress?
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '⚡',
                title: '30 Min Delivery',
                desc: 'Hot food at your doorstep in 30 minutes or less.',
              },
              {
                icon: '💳',
                title: 'bKash & Nagad',
                desc: 'Pay seamlessly with your favorite MFS provider.',
              },
              {
                icon: '🌶️',
                title: 'Authentic Flavors',
                desc: 'From Desi wraps to international burgers and pizza.',
              },
              {
                icon: '🛡️',
                title: 'Safe & Hygienic',
                desc: 'Every meal prepared in a certified clean kitchen.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-4 p-8 bg-white/3 border border-white/8 rounded-3xl hover:border-orange-500/30 hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
