'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { PaymentMethod } from '@/models/Order';

type PaymentGroup = {
  id: string;
  label: string;
  methods: {
    id: PaymentMethod;
    name: string;
    emoji: string;
    description: string;
    color: string;
    borderColor: string;
    bgColor: string;
  }[];
};

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'mfs',
    label: '📱 Mobile Financial Services (MFS)',
    methods: [
      {
        id: 'bkash',
        name: 'bKash',
        emoji: '💳',
        description: 'Pay instantly via bKash mobile banking',
        color: 'text-pink-400',
        borderColor: 'border-pink-500/40',
        bgColor: 'bg-pink-500/10',
      },
      {
        id: 'nagad',
        name: 'Nagad',
        emoji: '💰',
        description: 'Fast payment through Nagad wallet',
        color: 'text-orange-400',
        borderColor: 'border-orange-500/40',
        bgColor: 'bg-orange-500/10',
      },
    ],
  },
  {
    id: 'cash',
    label: '💵 Cash Payment',
    methods: [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        emoji: '🏠',
        description: 'Pay in cash when your order arrives',
        color: 'text-green-400',
        borderColor: 'border-green-500/40',
        bgColor: 'bg-green-500/10',
      },
    ],
  },
  {
    id: 'conversational',
    label: '💬 Conversational Orders',
    methods: [
      {
        id: 'whatsapp',
        name: 'WhatsApp / Phone Call',
        emoji: '📞',
        description: 'Chat with us or call to confirm your order',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-500/10',
      },
    ],
  },
];

interface FormData {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const totalAmount = getTotalAmount();
  const deliveryFee = totalAmount >= 300 ? 0 : 40;
  const grandTotal = totalAmount + deliveryFee;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+8801|01)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)';
    }
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConversationalOrder = () => {
    const orderSummary = items
      .map((i) => `${i.name} x${i.quantity} (৳${i.price * i.quantity})`)
      .join(', ');
    const message = encodeURIComponent(
      `Hello! I'd like to order:\n${orderSummary}\nTotal: ৳${grandTotal}\nName: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}`
    );
    window.open(`https://wa.me/8801XXXXXXXXX?text=${message}`, '_blank');
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (!selectedPayment) {
      setSubmitError('Please select a payment method');
      return;
    }

    if (selectedPayment === 'whatsapp') {
      handleConversationalOrder();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails: formData,
          items: items.map((item) => ({
            itemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: grandTotal,
          paymentMethod: selectedPayment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        router.push(`/order-tracking/${data.data._id}`);
      } else {
        setSubmitError(data.error ?? 'Failed to place order. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-center px-6">
        <div>
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-white text-3xl font-extrabold mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add items to your cart before checking out.</p>
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl inline-block"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-white mb-8 sm:mb-12"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Customer Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8"
            >
              <h2 className="text-white font-bold text-lg sm:text-xl mb-5 sm:mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 font-extrabold text-sm">1</span>
                Delivery Details
              </h2>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="customer-name" className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahim Uddin"
                    className={`w-full px-5 py-4 bg-white/5 border ${
                      errors.name ? 'border-red-500/60' : 'border-white/10 focus:border-orange-500/50'
                    } rounded-2xl text-white placeholder-gray-500 outline-none transition-colors focus:bg-white/8`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="customer-phone" className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number * (bKash/Nagad number)
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className={`w-full px-5 py-4 bg-white/5 border ${
                      errors.phone ? 'border-red-500/60' : 'border-white/10 focus:border-orange-500/50'
                    } rounded-2xl text-white placeholder-gray-500 outline-none transition-colors focus:bg-white/8`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="customer-address" className="block text-gray-300 text-sm font-medium mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    id="customer-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House no, Road, Area, Dhaka..."
                    rows={3}
                    className={`w-full px-5 py-4 bg-white/5 border ${
                      errors.address ? 'border-red-500/60' : 'border-white/10 focus:border-orange-500/50'
                    } rounded-2xl text-white placeholder-gray-500 outline-none transition-colors resize-none focus:bg-white/8`}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.address}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8"
            >
              <h2 className="text-white font-bold text-lg sm:text-xl mb-5 sm:mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 font-extrabold text-sm">2</span>
                Payment Method
              </h2>

              <div className="space-y-6">
                {PAYMENT_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="text-gray-400 text-xs sm:text-sm font-semibold mb-3">{group.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.methods.map((method) => {
                        const isSelected = selectedPayment === method.id;
                        return (
                          <motion.button
                            key={method.id}
                            id={`payment-method-${method.id}`}
                            onClick={() => setSelectedPayment(method.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                              ${
                                isSelected
                                  ? `${method.bgColor} ${method.borderColor} ${method.color}`
                                  : 'bg-white/3 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                              }
                            `}
                          >
                            <span className="text-2xl flex-shrink-0">{method.emoji}</span>
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="font-bold text-xs sm:text-sm">{method.name}</p>
                              <p className="text-[11px] sm:text-xs opacity-70 mt-0.5 leading-snug">{method.description}</p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-current flex items-center justify-center"
                              >
                                <span className="text-white text-xs font-bold">✓</span>
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* MFS Info */}
              <AnimatePresence>
                {(selectedPayment === 'bkash' || selectedPayment === 'nagad') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs sm:text-sm text-blue-300"
                  >
                    <p className="font-semibold mb-1">📱 {selectedPayment === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions:</p>
                    <p className="text-xs opacity-80 leading-relaxed">
                      After placing your order, you will receive a payment request to your registered number. Please complete the payment within 10 minutes to confirm your order.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6">
              <h2 className="text-white font-bold text-base sm:text-lg mb-5 sm:mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">x{item.quantity}</p>
                    </div>
                    <span className="text-orange-400 font-bold text-sm whitespace-nowrap">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span>৳{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-400' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `৳${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl border-t border-white/10 pt-3">
                  <span>Total</span>
                  <span className="text-orange-400">৳{grandTotal}</span>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                  >
                    {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Place Order Button */}
              <motion.button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : selectedPayment === 'whatsapp'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : selectedPayment === 'whatsapp' ? (
                  '💬 Order via WhatsApp'
                ) : (
                  '🚀 Place Order'
                )}
              </motion.button>

              <p className="text-gray-500 text-xs text-center mt-3">
                By placing your order, you agree to our terms of service.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
