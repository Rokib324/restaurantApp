'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', id: 'nav-dashboard' },
  { href: '/admin/orders', label: 'Orders', icon: '🧾', id: 'nav-orders' },
  { href: '/admin/menu', label: 'Menu Items', icon: '🍔', id: 'nav-menu' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️', id: 'nav-categories' },
  { href: '/admin/locations', label: 'Locations', icon: '📍', id: 'nav-locations' },
  { href: '/admin/notifications', label: 'Notifications', icon: '🔔', id: 'nav-notifications' },
  { href: '/admin/settings', label: 'Brand Settings', icon: '⚙️', id: 'nav-settings' },
];

export default function AdminSidebar() {
  const site = useSiteSettings();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
            <BrandLogo size={24} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{site.name}</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-6 border-t border-white/8">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-2"
        >
          <span className="text-lg">🌐</span>
          <span>View Website</span>
        </Link>
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all"
        >
          <span className="text-lg">🚪</span>
          <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Top Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <button
            id="admin-mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle admin navigation"
            className="w-10 h-10 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <span className="text-xl leading-none">{mobileOpen ? '✕' : '☰'}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-base shadow-md shadow-orange-500/20">
              <BrandLogo size={18} />
            </div>
            <div>
              <p className="text-white font-bold text-xs truncate max-w-[130px] sm:max-w-none">{site.name}</p>
              <p className="text-gray-400 text-[10px] leading-tight">Admin Console</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-sm text-gray-300 hover:text-white transition-colors"
            title="View Live Website"
          >
            🌐
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/75 z-45 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="lg:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-gray-900 border-r border-white/10 z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
                  <BrandLogo size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm truncate max-w-[140px]">{site.name}</p>
                  <p className="text-gray-500 text-[11px]">Control Center</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      id={`mobile-${item.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 border border-orange-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="px-4 py-4 border-t border-white/8 bg-gray-950/40 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <span className="text-base">🌐</span>
                <span>View Website</span>
              </Link>
              <button
                id="admin-mobile-logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <span className="text-base">🚪</span>
                <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/8 z-40 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
