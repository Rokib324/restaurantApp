'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24 lg:py-0 min-h-screen">
        {/* Left Column - Typography & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="z-10 flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-sm font-medium tracking-wide">
              🇧🇩 Dhaka&apos;s #1 Fast Food Destination
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight"
          >
            <span className="text-white">Hunger</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
              Solved.
            </span>
            <br />
            <span className="text-white text-4xl lg:text-5xl">Delivered Fast.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-gray-300 text-lg lg:text-xl max-w-lg leading-relaxed"
          >
            From juicy smash burgers to authentic desi wraps — order in seconds.
            Pay via <span className="text-pink-400 font-semibold">bKash</span>,{' '}
            <span className="text-orange-400 font-semibold">Nagad</span>, or Cash
            on Delivery. Hot food at your door!
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex gap-8 mt-2"
          >
            {[
              { value: '30 min', label: 'Avg Delivery' },
              { value: '16+', label: 'Menu Items' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-bold text-orange-400">{stat.value}</span>
                <span className="text-gray-400 text-xs uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4 mt-4"
          >
            <motion.button
              id="browse-menu-btn"
              onClick={scrollToMenu}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-500/30 transition-all duration-300"
            >
              🍔 Browse Menu
            </motion.button>
            <motion.a
              href="tel:+8801XXXXXXXXX"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 border-2 border-white/20 text-white font-bold text-lg rounded-2xl backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 flex items-center gap-2"
            >
              📞 Call Now
            </motion.a>
          </motion.div>

          {/* MFS Badge Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center gap-3 mt-2"
          >
            <span className="text-gray-500 text-sm">Pay via:</span>
            {[
              { name: 'bKash', color: 'bg-pink-600', emoji: '💳' },
              { name: 'Nagad', color: 'bg-orange-600', emoji: '💰' },
              { name: 'COD', color: 'bg-green-700', emoji: '💵' },
            ].map((method) => (
              <span
                key={method.name}
                className={`px-3 py-1 ${method.color} rounded-full text-white text-xs font-semibold flex items-center gap-1`}
              >
                {method.emoji} {method.name}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Floating Food Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="relative flex items-center justify-center z-10"
        >
          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[420px] h-[420px] lg:w-[520px] lg:h-[520px] rounded-full border-2 border-dashed border-orange-500/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full border border-red-500/10"
          />

          {/* Food Image */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-[320px] h-[320px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-4 border-orange-500/30 shadow-2xl shadow-orange-500/20"
          >
            <Image
              src="/hero-food.jpg"
              alt="Delicious Fast Food"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          {/* Floating Mini Cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-8 right-0 lg:-right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍔</span>
              <div>
                <p className="font-bold text-sm">Smash Burger</p>
                <p className="text-orange-400 text-xs font-semibold">৳250</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-12 left-0 lg:-left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <div>
                <p className="font-bold text-sm">BBQ Pizza</p>
                <p className="text-orange-400 text-xs font-semibold">৳380</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-4 right-4 lg:right-0 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-2xl px-4 py-3 text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-bold text-xs text-green-400">Free Delivery</p>
                <p className="text-gray-300 text-xs">Orders over ৳300</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
      >
        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-orange-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
