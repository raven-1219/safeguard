'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Users,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { login, availableUsers } = useAuth();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [email, setEmail] = useState('driver.rajesh@safeguard.gov.in');
  const [password, setPassword] = useState('safeguard123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset accounts
  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'driver') {
      setEmail('driver.rajesh@safeguard.gov.in');
    } else if (role === 'moderator') {
      setEmail('moderator.priya@safeguard.gov.in');
    } else if (role === 'admin') {
      setEmail('admin.director@safeguard.gov.in');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, selectedRole);
      if (success) {
        if (selectedRole === 'driver') {
          router.push('/driver');
        } else if (selectedRole === 'moderator') {
          router.push('/moderator');
        } else {
          router.push('/admin');
        }
      } else {
        setError(
          language === 'te'
            ? 'ఈమెయిల్ లేదా పాస్‌వర్డ్ సరైనది కాదు.'
            : 'Invalid credentials or user not found.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 items-center justify-center shadow-xl shadow-sky-500/20 mb-2">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t.app.title}</h1>
          <p className="text-xs text-slate-400">{t.nav.login} • Transit Safety Portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSelectRolePreset('driver')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              selectedRole === 'driver'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.roles.driver}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRolePreset('moderator')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              selectedRole === 'moderator'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.roles.moderator}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRolePreset('admin')}
            className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              selectedRole === 'admin'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.roles.admin}</span>
          </button>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.forms.email}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver.rajesh@safeguard.gov.in"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.forms.password}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 pr-10 text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.01]"
              >
                <span>{isSubmitting ? t.forms.loading : t.nav.login}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              1-Click Demo Profiles (Pre-configured):
            </span>
            <div className="space-y-1.5">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    handleSelectRolePreset(u.role);
                    setEmail(u.email);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] flex items-center justify-between border border-slate-800 transition-colors"
                >
                  <span className="text-slate-300 font-medium truncate">{u.full_name}</span>
                  <span className="text-[10px] font-bold uppercase text-sky-400 ml-2">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

