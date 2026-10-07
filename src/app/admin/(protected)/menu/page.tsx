'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ImageUploadZone from '@/components/admin/ImageUploadZone';

interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  tags: string[];
}

const EMPTY_FORM = {
  name: '',
  price: '',
  category: '',
  description: '',
  imageUrl: '',
  tags: '',
  isAvailable: true,
};

type FormState = typeof EMPTY_FORM;

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-white/8 sticky top-0 bg-gray-900/95 backdrop-blur z-10">
            <h2 className="text-white font-bold text-base sm:text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <div className="px-5 sm:px-7 py-5 sm:py-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ItemForm({
  form,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  categories,
}: {
  form: FormState;
  onChange: (field: keyof FormState, value: string | boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  categories: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Item Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Spicy Beef Burger"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>

      {/* Price + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
            Price (৳) *
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => onChange('price', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
            Category *
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            placeholder="burgers, pizza…"
            list="category-list"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
          />
          <datalist id="category-list">
            {categories.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the item…"
          rows={2}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors resize-none"
        />
      </div>

      {/* Image Upload Zone: Browse from files, Drag & Drop, or Paste (Ctrl+V) */}
      <ImageUploadZone
        value={form.imageUrl}
        onChange={(url) => onChange('imageUrl', url)}
        label="Food Item Photo"
      />

      {/* Tags */}
      <div>
        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Tags <span className="text-gray-500 font-normal normal-case">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => onChange('tags', e.target.value)}
          placeholder="spicy, popular, grill"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between py-3 px-4 bg-white/3 rounded-xl border border-white/8">
        <span className="text-gray-300 text-sm font-medium">Available for orders</span>
        <button
          type="button"
          onClick={() => onChange('isAvailable', !form.isAvailable)}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
            form.isAvailable ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
              form.isAvailable ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Submit */}
      <motion.button
        onClick={onSubmit}
        disabled={submitting || !form.name || !form.price || !form.category}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving…
          </span>
        ) : (
          submitLabel
        )}
      </motion.button>
    </div>
  );
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit modal
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirm
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Availability toggling
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Categories from DB
  const [dbCategories, setDbCategories] = useState<{ slug: string; name: string }[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      const [resItems, resCats] = await Promise.all([
        fetch('/api/admin/items'),
        fetch('/api/categories'),
      ]);
      const dataItems = await resItems.json();
      const dataCats = await resCats.json();
      if (dataItems.success) setItems(dataItems.data);
      if (dataCats.success && Array.isArray(dataCats.data)) setDbCategories(dataCats.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const categories = [
    'all',
    ...Array.from(new Set([...dbCategories.map((c) => c.slug), ...items.map((i) => i.category)])).sort(),
  ];

  const filteredItems = items.filter((item) => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // ─── Add ─────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    setAddError('');
    setAddSubmitting(true);
    try {
      const res = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          price: parseFloat(addForm.price),
          tags: addForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setAddForm({ ...EMPTY_FORM });
        await fetchItems();
      } else {
        setAddError(data.error || 'Failed to add item');
      }
    } catch {
      setAddError('Connection error. Please try again.');
    } finally {
      setAddSubmitting(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.tags.join(', '),
      isAvailable: item.isAvailable,
    });
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const res = await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: editItem._id,
          ...editForm,
          price: parseFloat(editForm.price),
          tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditItem(null);
        await fetchItems();
      } else {
        setEditError(data.error || 'Failed to update item');
      }
    } catch {
      setEditError('Connection error. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/items?id=${deleteItem._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteItem(null);
        await fetchItems();
      }
    } catch {/* noop */} finally {
      setDeleteSubmitting(false);
    }
  };

  // ─── Toggle availability ──────────────────────────────────────────────────
  const toggleAvailability = async (item: MenuItem) => {
    setTogglingId(item._id);
    try {
      await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item._id, isAvailable: !item.isAvailable }),
      });
      await fetchItems();
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">Menu Items</h1>
              <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                {items.length} items · {items.filter((i) => !i.isAvailable).length} unavailable
              </p>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <Link
                href="/admin/categories"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold rounded-2xl text-xs sm:text-sm transition-colors"
                title="Manage categories"
              >
                <span>🏷️</span>
                <span>Categories</span>
              </Link>
              <motion.button
                id="add-menu-item-btn"
                onClick={() => { setShowAdd(true); setAddError(''); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
              >
                ＋ Add Item
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Items', value: items.length, color: 'text-white' },
            { label: 'Available', value: items.filter((i) => i.isAvailable).length, color: 'text-green-400' },
            { label: 'Unavailable', value: items.filter((i) => !i.isAvailable).length, color: 'text-red-400' },
            { label: 'Categories', value: categories.length - 1, color: 'text-orange-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            id="menu-search"
            type="text"
            placeholder="🔍 Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-orange-500/40 transition-colors text-sm"
          />
          <select
            id="menu-category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-800 border border-white/10 text-gray-300 text-sm rounded-2xl px-5 py-3 outline-none cursor-pointer hover:border-orange-500/40 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Items Table-style Grid */}
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-8">
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
              {category}
              <span className="ml-2 text-gray-600">({catItems.length})</span>
            </h2>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 mb-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <span className="w-12">Image</span>
              <span>Name / Description</span>
              <span className="text-right w-20">Price</span>
              <span className="text-center w-24">Status</span>
              <span className="text-center w-24">Available</span>
              <span className="text-center w-24">Actions</span>
            </div>

            <div className="space-y-2">
              {catItems.map((item, i) => {
                const isToggling = togglingId === item._id;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${
                      item.isAvailable ? 'border-white/8' : 'border-red-500/20 opacity-70'
                    }`}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-3">
                      {/* Image */}
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className={`object-cover ${!item.isAvailable ? 'grayscale' : ''}`}
                            sizes="48px"
                            unoptimized={item.imageUrl.startsWith('/uploads/')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                        )}
                      </div>

                      {/* Name + desc */}
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs truncate mt-0.5">{item.description || 'No description'}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-gray-600 bg-white/4 px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <p className="text-orange-400 font-bold text-sm text-right w-20">৳{item.price}</p>

                      {/* Status badge */}
                      <div className="w-24 flex justify-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                            item.isAvailable
                              ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.isAvailable ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      {/* Toggle */}
                      <div className="w-24 flex justify-center">
                        <button
                          id={`toggle-${item._id}`}
                          onClick={() => toggleAvailability(item)}
                          disabled={isToggling}
                          title={item.isAvailable ? 'Hide item' : 'Make available'}
                          className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                            item.isAvailable ? 'bg-green-500' : 'bg-gray-600'
                          } ${isToggling ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                              item.isAvailable ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="w-24 flex justify-center gap-2">
                        <button
                          id={`edit-item-${item._id}`}
                          onClick={() => openEdit(item)}
                          title="Edit item"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          id={`delete-item-${item._id}`}
                          onClick={() => setDeleteItem(item)}
                          title="Delete item"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="flex md:hidden items-start gap-3 p-4">
                      <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized={item.imageUrl.startsWith('/uploads/')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white font-semibold text-sm">{item.name}</p>
                          <p className="text-orange-400 font-bold text-sm flex-shrink-0">৳{item.price}</p>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => toggleAvailability(item)}
                            disabled={isToggling}
                            className={`w-9 h-5 rounded-full relative transition-all ${item.isAvailable ? 'bg-green-500' : 'bg-gray-600'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.isAvailable ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                          <span className="text-gray-500 text-xs">{item.isAvailable ? 'Active' : 'Hidden'}</span>
                          <div className="ml-auto flex gap-1.5">
                            <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm flex items-center justify-center">✏️</button>
                            <button onClick={() => setDeleteItem(item)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 text-sm flex items-center justify-center">🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-400 font-medium">No items found</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-2xl text-sm hover:bg-orange-500/25 transition-colors"
            >
              Add your first item
            </button>
          </div>
        )}
      </div>

      {/* ── Add Modal ──────────────────────────────────────────────────────── */}
      {showAdd && (
        <Modal title="➕ Add New Item" onClose={() => setShowAdd(false)}>
          <ItemForm
            form={addForm}
            onChange={(field, val) => setAddForm((f) => ({ ...f, [field]: val }))}
            onSubmit={handleAdd}
            submitting={addSubmitting}
            submitLabel="Add Item"
            categories={categories}
          />
          {addError && (
            <p className="mt-3 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
              ⚠️ {addError}
            </p>
          )}
        </Modal>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editItem && (
        <Modal title="✏️ Edit Item" onClose={() => setEditItem(null)}>
          <ItemForm
            form={editForm}
            onChange={(field, val) => setEditForm((f) => ({ ...f, [field]: val }))}
            onSubmit={handleEdit}
            submitting={editSubmitting}
            submitLabel="Save Changes"
            categories={categories}
          />
          {editError && (
            <p className="mt-3 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
              ⚠️ {editError}
            </p>
          )}
        </Modal>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      {deleteItem && (
        <Modal title="🗑️ Delete Item" onClose={() => setDeleteItem(null)}>
          <div className="text-center space-y-4">
            {deleteItem.imageUrl && (
              <div className="relative h-32 rounded-2xl overflow-hidden mx-auto max-w-xs">
                <Image
                  src={deleteItem.imageUrl}
                  alt={deleteItem.name}
                  fill
                  className="object-cover opacity-60"
                  sizes="300px"
                  unoptimized={deleteItem.imageUrl.startsWith('/uploads/')}
                />
              </div>
            )}
            <p className="text-white font-semibold text-lg">{deleteItem.name}</p>
            <p className="text-gray-400 text-sm">
              This will permanently remove <span className="text-white font-medium">{deleteItem.name}</span> from the menu. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <motion.button
                id="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleteSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting…' : '🗑️ Delete'}
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
