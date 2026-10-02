'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploadZone({
  value,
  onChange,
  label = 'Item Image',
  className = '',
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Upload file to server
  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size is too large (max 10MB).');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  // Handle File Input Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadFile(file);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  // Handle Clipboard Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in a text/textarea/input field other than our manual URL input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target.id !== 'manual-url-input'
      ) {
        return;
      }

      if (!e.clipboardData) return;

      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadFile]);

  // Manual URL confirm
  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          {showUrlInput ? '← Use file / paste' : 'Enter image URL instead'}
        </button>
      </div>

      {/* Manual URL Input Option */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-2"
          >
            <input
              id="manual-url-input"
              type="url"
              placeholder="Paste direct image link (https://...)"
              value={manualUrl || (value.startsWith('http') ? value : '')}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-xs outline-none focus:border-orange-500/50"
            />
            <button
              type="button"
              onClick={handleApplyManualUrl}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Active Image Preview State */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group">
          <div className="relative h-44 w-full">
            <Image
              src={value}
              alt="Item preview"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 500px"
              unoptimized={value.startsWith('/uploads/')}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Quick Actions */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="text-xs text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 truncate max-w-[200px]">
                {value.startsWith('/uploads/') ? '📁 Uploaded File' : '🔗 Web Image'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <span>🔄</span> Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-1"
                >
                  <span>🗑️</span> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
              : 'border-white/15 bg-white/3 hover:bg-white/6 hover:border-white/25'
          } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-9 h-9 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
              <p className="text-white text-sm font-semibold">Uploading image…</p>
              <p className="text-gray-400 text-xs mt-1">Optimizing and saving to server</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/15 border border-orange-500/25 flex items-center justify-center text-2xl mb-3 shadow-inner">
                {isDragging ? '📥' : '🖼️'}
              </div>
              <p className="text-white text-sm font-bold">
                {isDragging ? 'Release to upload image' : 'Upload food photo'}
              </p>
              <p className="text-gray-400 text-xs mt-1.5 max-w-xs">
                Drag & drop, tap to choose from <span className="text-orange-400 font-medium">files/gallery</span>, or press <span className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">Ctrl+V / Cmd+V</span> to paste
              </p>
              <div className="mt-3.5 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-[11px] text-gray-400 font-mono">
                  PNG, JPG, WebP, GIF
                </span>
                <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-[11px] text-gray-400 font-mono">
                  Max 10MB
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center"
        >
          ⚠️ {uploadError}
        </motion.p>
      )}
    </div>
  );
}
