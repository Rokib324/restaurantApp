'use client';

import React, { useState } from 'react';
import { LocationItem } from './LocationCard';

interface DeleteConfirmModalProps {
  location: LocationItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirmModal({
  location,
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/locations?id=${location._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete location');
      }
      onDeleted(location._id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error deleting location');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-2xl flex items-center justify-center mx-auto mb-4">
          🗑️
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Delete Location?</h3>
        <p className="text-gray-400 text-sm mb-4">
          Are you sure you want to delete <strong className="text-white">{location.name}</strong> ({location.area})?
          This branch and its phone number will be removed from the public website and interactive map.
        </p>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {submitting ? 'Deleting…' : 'Yes, Delete Branch'}
          </button>
        </div>
      </div>
    </div>
  );
}
