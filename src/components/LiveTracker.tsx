'use client';

import { motion } from 'framer-motion';
import { OrderStatus } from '@/models/Order';

interface LiveTrackerProps {
  orderStatus: OrderStatus;
  orderId: string;
  estimatedTime?: number; // minutes
}

const STEPS: { status: OrderStatus; label: string; sublabel: string; icon: string }[] = [
  {
    status: 'received',
    label: 'Order Received',
    sublabel: 'We got your order!',
    icon: '✅',
  },
  {
    status: 'preparing',
    label: 'Preparing in Kitchen',
    sublabel: 'Our chefs are cooking',
    icon: '👨‍🍳',
  },
  {
    status: 'packaging',
    label: 'Packaging Food',
    sublabel: 'Almost ready!',
    icon: '📦',
  },
  {
    status: 'delivered',
    label: 'Out for Delivery',
    sublabel: 'On the way to you!',
    icon: '🛵',
  },
];

const STATUS_ORDER: OrderStatus[] = ['received', 'preparing', 'packaging', 'delivered'];

function getStatusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export default function LiveTracker({ orderStatus, orderId, estimatedTime = 30 }: LiveTrackerProps) {
  const currentIndex = getStatusIndex(orderStatus);
  const progressPercent = Math.round((currentIndex / (STEPS.length - 1)) * 100);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-white font-bold text-lg sm:text-xl">Live Order Tracking</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 font-mono">Order #{orderId.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-orange-400 font-bold text-xl sm:text-2xl">{estimatedTime} min</div>
          <div className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Est. Time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8 sm:mb-10">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          />
        </div>
        <div className="absolute -top-1 right-0 text-orange-400 text-xs font-bold">
          {progressPercent}%
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-5 sm:space-y-6">
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isActive = index === currentIndex;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className={`relative flex items-center gap-3.5 sm:gap-6 pl-0 ${
                  isCompleted ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/40'
                      : isCompleted
                      ? 'bg-green-500/20 border border-green-500/40'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {step.icon}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-xl sm:rounded-2xl bg-orange-500/20"
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h3
                      className={`font-bold text-sm sm:text-base leading-tight ${
                        isActive
                          ? 'text-orange-400'
                          : isCompleted
                          ? 'text-green-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCompleted && !isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 text-xs sm:text-sm font-bold"
                      >
                        ✓ Done
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1 text-orange-400 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        In Progress
                      </motion.span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{step.sublabel}</p>
                </div>

                {/* Step indicator line */}
                {index < STEPS.length - 1 && (
                  <div className="absolute left-6 sm:left-8 top-12 sm:top-16 h-5 sm:h-6 w-px">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: isCompleted ? 1 : 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="w-full h-full bg-green-500/50 origin-top"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delivery Status Footer */}
      {orderStatus === 'delivered' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 sm:mt-8 p-4 sm:p-5 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">🎉</div>
          <h3 className="text-green-400 font-bold text-base sm:text-lg">Order Delivered!</h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Thank you for ordering with us. Enjoy your meal!</p>
        </motion.div>
      )}

      {/* Help CTA */}
      {orderStatus !== 'delivered' && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:+8801XXXXXXXXX"
            className="flex-1 py-3 text-center border border-white/10 rounded-xl text-gray-300 text-xs sm:text-sm font-semibold hover:border-orange-500/40 hover:text-orange-400 transition-all duration-200"
          >
            📞 Call Restaurant
          </a>
          <a
            href={`https://wa.me/8801XXXXXXXXX?text=My order ID is ${orderId}. Can you help?`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 text-center bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 text-xs sm:text-sm font-semibold hover:bg-green-600/30 transition-all duration-200"
          >
            💬 WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
