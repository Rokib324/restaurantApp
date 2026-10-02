'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description?: string;
  order: number;
  itemCount: number;
}

const COMMON_EMOJIS = [
  '🍽️', '🍔', '🍕', '🌯', '🍟', '🥤', '🍰',
  '🍚', '🍗', '🥩', '🥗', '🍜', '🥘', '🌮',
  '☕', '🍩', '🍣', '🍱', '🥪', '🍦', '🥞',
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEmoji, setFormEmoji] = useState('🍽️');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteWithItems, setDeleteWithItems] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add Modal
  const openAdd = () => {
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) + 1 : 1;
    setFormName('');
    setFormSlug('');
    setFormEmoji('🍽️');
    setFormDescription('');
    setFormOrder(nextOrder);
    setErrorMsg(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormEmoji(cat.emoji || '🍽️');
    setFormDescription(cat.description || '');
    setFormOrder(cat.order || 0);
    setErrorMsg(null);
  };

  // Handle Name Change with auto-slug in Add mode
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(slugify(val));
    }
  };

  // Create Category
  const handleCreate = async () => {
    if (!formName.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || slugify(formName),
          emoji: formEmoji,
          description: formDescription.trim(),
          order: formOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create category');
      }

      setShowAddModal(false);
      await fetchCategories();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating category');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Category
  const handleUpdate = async () => {
    if (!editingCategory || !formName.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: editingCategory._id,
          name: formName.trim(),
          slug: formSlug.trim(),
          emoji: formEmoji,
          description: formDescription.trim(),
          order: formOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update category');
      }

      setEditingCategory(null);
      await fetchCategories();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating category');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!deletingCategory) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const url = `/api/admin/categories?id=${deletingCategory._id}&deleteItems=${deleteWithItems}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to delete category');
      }

      setDeletingCategory(null);
      setDeleteWithItems(false);
      await fetchCategories();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error deleting category');
    } finally {
      setSubmitting(false);
    }
  };

  const totalItemsCovered = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);

  return (
    <div className="px-4 lg:px-10 py-8 max-w-7xl w-full">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg">
              Menu Taxonomy
            </span>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your food categories. Categories control the ordering filters on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-2xl transition-all"
            title="Refresh categories"
          >
            🔄 Refresh
          </button>
          <motion.button
            id="add-category-btn"
            onClick={openAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:opacity-95 transition-all"
          >
            <span>➕</span>
            <span>Add Category</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── KPI Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Categories</p>
          <p className="text-white text-2xl font-black mt-1">{categories.length}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Menu Items Grouped</p>
          <p className="text-orange-400 text-2xl font-black mt-1">{totalItemsCovered}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Empty Categories</p>
          <p className="text-yellow-400 text-2xl font-black mt-1">
            {categories.filter((c) => c.itemCount === 0).length}
          </p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Quick Link</p>
          <Link
            href="/admin/menu"
            className="text-blue-400 hover:text-blue-300 font-bold text-sm flex items-center gap-1 mt-2.5 transition-colors"
          >
            <span>View Menu Items</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* ─── Categories List ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white/3 border border-white/8 rounded-3xl p-8">
          <div className="text-5xl mb-3">🏷️</div>
          <p className="text-white font-bold text-lg">No Categories Found</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Create your first food category to organize the menu.</p>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/8 rounded-3xl p-5 hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {cat.emoji || '🍽️'}
                    </span>
                    <div>
                      <h3 className="text-white font-extrabold text-lg leading-tight group-hover:text-orange-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-gray-500 text-xs font-mono mt-0.5">
                        slug: <span className="text-orange-400/80">/{cat.slug}</span>
                      </p>
                    </div>
                  </div>

                  {/* Order badge */}
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] text-gray-400 font-mono" title="Display Order">
                    #{cat.order || 0}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xs line-clamp-2 min-h-[32px] mb-4">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              {/* Bottom stats & action bar */}
              <div className="pt-3 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>
                    <strong className="text-white">{cat.itemCount}</strong> items
                  </span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-200 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Edit category"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCategory(cat);
                      setDeleteWithItems(false);
                      setErrorMsg(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Delete category"
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(showAddModal || editingCategory) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) {
                setShowAddModal(false);
                setEditingCategory(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{formEmoji || '🏷️'}</span>
                  <h3 className="text-white font-bold text-lg">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Emoji Selector */}
                <div>
                  <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-2">
                    Category Icon / Emoji
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white/3 border border-white/8 rounded-2xl max-h-28 overflow-y-auto">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          formEmoji === emoji
                            ? 'bg-orange-500/25 border-2 border-orange-500 scale-110 shadow-md shadow-orange-500/30'
                            : 'bg-white/5 hover:bg-white/15 border border-transparent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Custom:</span>
                    <input
                      type="text"
                      value={formEmoji}
                      onChange={(e) => setFormEmoji(e.target.value)}
                      placeholder="e.g. 🥘"
                      maxLength={4}
                      className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-sm outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>

                {/* Category Name */}
                <div>
                  <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Biryani & Rice, Appetizers…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                {/* Slug & Order Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(slugify(e.target.value))}
                      placeholder="e.g. biryani"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-mono outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formOrder}
                      onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                      placeholder="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                    Description <span className="text-gray-500 font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description for this category…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
                  >
                    ⚠️ {errorMsg}
                  </motion.p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-white/8 bg-gray-950/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  onClick={editingCategory ? handleUpdate : handleCreate}
                  disabled={submitting || !formName.trim()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingCategory ? (
                    'Save Changes'
                  ) : (
                    'Create Category'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {deletingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) {
                setDeletingCategory(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                🗑️
              </div>

              <h3 className="text-white font-extrabold text-lg mb-1">
                Delete &ldquo;{deletingCategory.name}&rdquo;?
              </h3>

              {deletingCategory.itemCount > 0 ? (
                <div className="my-4 text-left p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                  <p className="text-red-400 font-semibold text-xs flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Warning: Category is in use!</span>
                  </p>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    There are currently <strong className="text-white">{deletingCategory.itemCount} menu item(s)</strong> assigned to this category.
                  </p>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deleteWithItems}
                      onChange={(e) => setDeleteWithItems(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <span className="text-xs text-red-300 font-medium">
                      Also delete all {deletingCategory.itemCount} items attached to this category
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-gray-400 text-sm my-3">
                  Are you sure you want to permanently delete this category? This action cannot be undone.
                </p>
              )}

              {errorMsg && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 my-2">
                  ⚠️ {errorMsg}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || (deletingCategory.itemCount > 0 && !deleteWithItems)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Deleting…' : 'Delete Category'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
