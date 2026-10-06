'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploadZone from '@/components/admin/ImageUploadZone';
import BrandLogo from '@/components/ui/BrandLogo';
import { DEFAULT_SITE_SETTINGS, SiteSettingsData, splitBrandName } from '@/config/site';

const LOGO_EMOJIS = [
  '🍔', '🍕', '🍽️', '🌯', '🍗', '🍜', '🍣', '🥘',
  '🍛', '🥗', '🌮', '🍩', '☕', '🧁', '🥩', '🔥',
];

const inputCls =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all';

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function BrandSettingsForm({ initial }: { initial: SiteSettingsData }) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettingsData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const [nameStart, nameHighlight, nameEnd] = splitBrandName(form.name || 'Your Restaurant', form.nameHighlight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Restaurant name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save settings');
      setForm(data.data);
      setSaved(true);
      router.refresh(); // re-render server layout so the new branding shows everywhere
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 lg:px-10 py-8 max-w-7xl w-full">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg">
            White-label
          </span>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mt-2">Brand Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Restaurant name, logo and identity used across the whole website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="reset-settings-btn"
            disabled={!isDirty || saving}
            onClick={() => {
              setForm(initial);
              setError(null);
            }}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↺ Discard
          </button>
          <motion.button
            type="submit"
            id="save-settings-btn"
            disabled={saving || !isDirty}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <span>💾</span>
            )}
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {(error || saved) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-6 px-4 py-3 rounded-2xl text-sm font-medium border ${
              error
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {error ? `⚠️ ${error}` : '✅ Settings saved — the website now shows your new branding.'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Form ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Identity */}
          <section className="bg-white/5 border border-white/8 rounded-3xl p-6 space-y-5">
            <h2 className="text-white font-extrabold text-lg flex items-center gap-2">🏷️ Identity</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="setting-name" label="Restaurant Name *">
                <input
                  id="setting-name"
                  className={inputCls}
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Burger Barn"
                  required
                />
              </Field>
              <Field
                id="setting-highlight"
                label="Highlighted Part"
                hint="Part of the name shown in orange in the footer (optional)."
              >
                <input
                  id="setting-highlight"
                  className={inputCls}
                  value={form.nameHighlight}
                  maxLength={80}
                  onChange={(e) => set('nameHighlight', e.target.value)}
                  placeholder="e.g. Barn"
                />
              </Field>
            </div>

            <Field id="setting-tagline" label="Tagline" hint="Shown under the logo in the footer.">
              <input
                id="setting-tagline"
                className={inputCls}
                value={form.tagline}
                maxLength={120}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g. Fast Delivery · Dhaka"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="setting-legal" label="Legal / Company Name" hint="Used in the © copyright line.">
                <input
                  id="setting-legal"
                  className={inputCls}
                  value={form.legalName}
                  maxLength={120}
                  onChange={(e) => set('legalName', e.target.value)}
                  placeholder="e.g. Burger Barn Ltd."
                />
              </Field>
              <Field id="setting-email" label="Contact E-mail">
                <input
                  id="setting-email"
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="hello@restaurant.com"
                />
              </Field>
            </div>
          </section>

          {/* Logo */}
          <section className="bg-white/5 border border-white/8 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-extrabold text-lg flex items-center gap-2">🎨 Logo</h2>
              {form.logoUrl && (
                <button
                  type="button"
                  id="remove-logo-btn"
                  onClick={() => set('logoUrl', '')}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove image &amp; use emoji
                </button>
              )}
            </div>

            <ImageUploadZone
              value={form.logoUrl}
              onChange={(url) => set('logoUrl', url)}
              label="Logo Image (square PNG/SVG/WebP recommended)"
            />

            <div className={form.logoUrl ? 'opacity-40 pointer-events-none' : ''}>
              <p className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Emoji Logo {form.logoUrl && <span className="normal-case text-gray-500">(used when no image is set)</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {LOGO_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => set('logoEmoji', emoji)}
                    className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center border transition-all hover:scale-110 ${
                      form.logoEmoji === emoji
                        ? 'bg-orange-500/20 border-orange-500/60 shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                    aria-label={`Use ${emoji} as logo`}
                  >
                    {emoji}
                  </button>
                ))}
                <input
                  id="setting-emoji"
                  className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-center text-xl focus:outline-none focus:border-orange-500/60"
                  value={form.logoEmoji}
                  maxLength={16}
                  onChange={(e) => set('logoEmoji', e.target.value)}
                  aria-label="Custom emoji"
                  title="Type or paste any emoji"
                />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="bg-white/5 border border-white/8 rounded-3xl p-6 space-y-5">
            <h2 className="text-white font-extrabold text-lg flex items-center gap-2">🔎 Search Engines</h2>
            <Field
              id="setting-description"
              label="Meta Description"
              hint={`${form.description.length}/300 — shown in Google results and link previews.`}
            >
              <textarea
                id="setting-description"
                rows={3}
                maxLength={300}
                className={`${inputCls} resize-none`}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={DEFAULT_SITE_SETTINGS.description}
              />
            </Field>
          </section>
        </div>

        {/* ─── Live Preview ───────────────────────────────────────────────── */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-8 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Preview</p>

            {/* Navbar preview */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-gray-950">
              <div className="px-5 h-14 flex items-center justify-between bg-gray-950/80 border-b border-white/10">
                <div className="flex items-center gap-2 font-extrabold text-lg">
                  <BrandLogo size={28} className="text-2xl" logoUrl={form.logoUrl} logoEmoji={form.logoEmoji} name={form.name} />
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent truncate max-w-[180px]">
                    {form.name || 'Your Restaurant'}
                  </span>
                </div>
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-xs font-semibold">
                  🛒 Cart
                </span>
              </div>
              <p className="px-5 py-2 text-[10px] uppercase tracking-widest text-gray-600">Navbar</p>
            </div>

            {/* Footer preview */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-gray-950 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/25">
                  <BrandLogo size={28} logoUrl={form.logoUrl} logoEmoji={form.logoEmoji} name={form.name} />
                </div>
                <div className="min-w-0">
                  <span className="text-xl font-extrabold text-white tracking-tight block truncate">
                    {nameStart}
                    {nameHighlight && <span className="text-orange-400">{nameHighlight}</span>}
                    {nameEnd}
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold block truncate">
                    {form.tagline}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 border-t border-white/8 pt-3">
                © {new Date().getFullYear()} {form.legalName || form.name} All rights reserved.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-600">Footer</p>
            </div>

            {/* Google preview */}
            <div className="rounded-3xl border border-white/10 bg-white p-5">
              <p className="text-[#1a0dab] text-lg leading-snug truncate">
                {form.name || 'Your Restaurant'} | Fast Food Delivery in Dhaka
              </p>
              <p className="text-[#4d5156] text-sm mt-1 line-clamp-2">
                {form.description || DEFAULT_SITE_SETTINGS.description}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-3">Google result</p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
