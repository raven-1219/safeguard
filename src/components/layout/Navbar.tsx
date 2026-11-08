'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth, isSupabaseConfigured } from '@/lib/supabase/client';
import { audioManager } from '@/lib/audio/alarmSound';
import { offlineSyncManager } from '@/lib/offline/syncQueue';
import {
  ShieldAlert,
  Activity,
  Users,
  FileText,
  Volume2,
  VolumeX,
  Globe,
  LogOut,
  ChevronDown,
  Wifi,
  WifiOff,
  Database,
  Cloud,
  CloudOff,
  LogIn,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, logout, availableUsers, switchUser, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const [isMuted, setIsMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const unsub = offlineSyncManager.subscribe((qLen, online) => {
      setQueueCount(qLen);
      setIsOnline(online);
    });
    return () => unsub();
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioManager.setMuted(next);
  };

  const navLinks = [
    { href: '/driver', label: t.nav.driverPortal, icon: Activity, show: true },
    { href: '/moderator', label: t.nav.moderatorPortal, icon: Users, show: role === 'moderator' || role === 'admin' },
    { href: '/admin', label: t.nav.adminPortal, icon: ShieldAlert, show: role === 'admin' },
    { href: '/reports', label: t.nav.reports, icon: FileText, show: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      {/* Top Transparent Connection Bar */}
      <div className="bg-slate-950 border-b border-slate-850 px-4 py-1 text-[11px] flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-300">
              {isSupabaseConfigured
                ? 'Supabase Cloud Connected (PostgreSQL RLS Active)'
                : 'Local Offline Storage Mode (Demonstration Persistence)'}
            </span>
          </span>

          {queueCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              {queueCount} Pending Sync
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <span className="text-[10px] text-slate-400">
            Scope: Laptop Webcam & Audio (Hardware Excluded)
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-sky-400">
                  {t.app.title}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-sky-950 text-sky-300 border border-sky-800">
                  AI Transit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t.app.subtitle}
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks
              .filter((item) => item.show)
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Right Controls: Audio, Online, Language, User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Online Status Pill */}
            <div
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800'
              }`}
              title={isOnline ? 'Online Synced' : 'Offline Mode (Local Storage)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* Mute Audio Button */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  : 'bg-sky-950/60 text-sky-400 border-sky-800 hover:bg-sky-900/60'
              }`}
              title={isMuted ? 'Unmute Audio Warning Siren' : 'Mute Audio Warning Siren'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Bilingual Switcher (English / Telugu) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              title="Switch Language / భాష మార్చుకోండి"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* User Profile / Quick Role Switcher */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-700 flex items-center justify-center font-bold text-[10px] text-white">
                    {user?.full_name ? user.full_name[0] : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="font-semibold text-[11px] leading-tight truncate max-w-[120px]">
                      {user?.full_name?.split(' ')[0]}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-sky-400 leading-tight">
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Role Switcher Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-750 text-xs">
                      <p className="text-slate-400 text-[10px] font-semibold uppercase">
                        Current Account
                      </p>
                      <p className="text-white font-medium truncate">{user?.full_name}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <p className="px-3 py-1 text-[9px] font-bold uppercase text-slate-500">
                        Quick Switch (Demo Accounts)
                      </p>
                      {availableUsers.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => {
                            switchUser(profile.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user?.id === profile.id
                              ? 'bg-sky-600/30 text-sky-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{profile.full_name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                            {profile.role}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 border-t border-slate-750 flex items-center justify-between px-1">
                      <Link
                        href="/login"
                        onClick={() => setShowUserDropdown(false)}
                        className="px-2 py-1 text-[11px] text-sky-400 hover:underline"
                      >
                        Sign in page
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="px-2 py-1 rounded text-xs text-rose-400 hover:bg-rose-950/40 flex items-center space-x-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
