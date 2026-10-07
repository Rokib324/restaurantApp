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

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center pt-28 pb-16 lg:py-0 min-h-screen">
        {/* Left Column - Typography & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="z-10 flex flex-col gap-5 sm:gap-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-orange-500/15 border border-orange-500/30 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-xs sm:text-sm font-medium tracking-wide">
              🇧🇩 Dhaka&apos;s #1 Fast Food Destination
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight"
          >
            <span className="text-white">Hunger</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
              Solved.
            </span>
            <br />
            <span className="text-white text-3xl xs:text-4xl sm:text-5xl">Delivered Fast.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-lg leading-relaxed"
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
            className="flex gap-6 sm:gap-8 flex-wrap mt-1 sm:mt-2"
          >
            {[
              { value: '30 min', label: 'Avg Delivery' },
              { value: '16+', label: 'Menu Items' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-orange-400">{stat.value}</span>
                <span className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-3 sm:mt-4"
          >
            <motion.button
              id="browse-menu-btn"
              onClick={scrollToMenu}
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-orange-500/30 transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              🍔 Browse Menu
            </motion.button>
            <motion.a
              href="tel:+8801XXXXXXXXX"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full xs:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-white/20 text-white font-bold text-base sm:text-lg rounded-2xl backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 text-center"
            >
              📞 Call Now
            </motion.a>
          </motion.div>

          {/* MFS Badge Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2"
          >
            <span className="text-gray-500 text-xs sm:text-sm">Pay via:</span>
            {[
              { name: 'bKash', color: 'bg-pink-600', emoji: '💳' },
              { name: 'Nagad', color: 'bg-orange-600', emoji: '💰' },
              { name: 'COD', color: 'bg-green-700', emoji: '💵' },
            ].map((method) => (
              <span
                key={method.name}
                className={`px-2.5 sm:px-3 py-1 ${method.color} rounded-full text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1`}
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
          className="relative flex items-center justify-center z-10 py-6 lg:py-0"
        >
          {/* Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[520px] lg:h-[520px] rounded-full border-2 border-dashed border-orange-500/20 will-change-transform pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] lg:w-[450px] lg:h-[450px] rounded-full border border-red-500/10 will-change-transform pointer-events-none"
          />

          {/* Food Image */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-[220px] h-[220px] xs:w-[260px] xs:h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-4 border-orange-500/30 shadow-2xl shadow-orange-500/20 will-change-transform"
          >
            <Image
              src="/hero-food.jpg"
              alt="Delicious Fast Food"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 320px, 420px"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Floating Mini Cards (GPU-accelerated without heavy backdrop-filter thrashing) */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute top-2 xs:top-4 lg:top-8 -right-2 xs:right-0 lg:-right-4 bg-gray-900/95 border border-white/20 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-white shadow-xl will-change-transform scale-90 sm:scale-100 origin-right"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🍔</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">Smash Burger</p>
                <p className="text-orange-400 text-[11px] sm:text-xs font-semibold">৳250</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute bottom-4 xs:bottom-8 lg:bottom-12 -left-2 xs:left-0 lg:-left-4 bg-gray-900/95 border border-white/20 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-white shadow-xl will-change-transform scale-90 sm:scale-100 origin-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🍕</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">BBQ Pizza</p>
                <p className="text-orange-400 text-[11px] sm:text-xs font-semibold">৳380</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="absolute -bottom-2 xs:bottom-2 lg:bottom-4 right-0 xs:right-2 lg:right-0 bg-gray-900/95 border border-green-500/40 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-white shadow-xl will-change-transform scale-90 sm:scale-100 origin-bottom-right"
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">✅</span>
              <div>
                <p className="font-bold text-[11px] sm:text-xs text-green-400">Free Delivery</p>
                <p className="text-gray-300 text-[10px] sm:text-xs">Orders over ৳300</p>
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
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-400"
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
