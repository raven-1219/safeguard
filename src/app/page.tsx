'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Users,
  Eye,
  Heart,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockStore';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { role, switchUser, availableUsers } = useAuth();

  const driverUser = availableUsers.find((u) => u.role === 'driver');
  const modUser = availableUsers.find((u) => u.role === 'moderator');
  const adminUser = availableUsers.find((u) => u.role === 'admin');

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>{t.app.status}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.app.title}
          </h1>

          <p className="text-lg sm:text-xl text-sky-200 font-medium">
            {t.app.subtitle}
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.app.tagline}. Powered by client-side MediaPipe landmark geometry, MobileNetV3 CNN drowsiness classification, pose collapse detection, and real-time fleet synchronization.
          </p>

          {/* Quick Portal Action Buttons */}
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/driver"
              onClick={() => driverUser && switchUser(driverUser.id)}
              className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Driver AI Monitor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/moderator"
              onClick={() => modUser && switchUser(modUser.id)}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Open Moderator Fleet Hub</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => adminUser && switchUser(adminUser.id)}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Admin Command Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Based Portals Showcase */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Role-Based Access Control Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated functional environments for drivers, fleet moderators, and transport administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Driver Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-sky-500/40 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.driver}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local in-browser webcam facial fatigue monitoring, EAR/MAR calculation, head pose distraction detector, offline Web Audio sirens, and active trip telemetry.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EAR & MAR Blink/Yawn Tracker</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seat Belt Contrast Detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Offline Web Audio Alarms</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/driver"
                onClick={() => driverUser && switchUser(driverUser.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter Driver Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Moderator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.moderator}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervises assigned fleets of 10 to 50 public transport drivers. Live OpenStreetMap GPS tracking, real-time emergency alert stream, and event resolution workflow.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Driver Grid (10-50 Drivers)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Vehicle Telemetry Map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emergency Acknowledge & Resolve</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/moderator"
                onClick={() => modUser && switchUser(modUser.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter Moderator Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.admin}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete organization-level control: register drivers and buses, manage moderator group assignments, inspect security audit logs, and export official safety reports.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fleet Management & Assignments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security Audit Logs & Compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Safety Report Exporter</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/admin"
                onClick={() => adminUser && switchUser(adminUser.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter Admin Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Live Quick Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-base text-white mb-4">
          Public Transit Network Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">
              {mockDb.profiles.filter((p) => p.role === 'driver').length}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Registered Drivers</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {mockDb.vehicles.length}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Monitored Buses</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {mockDb.trips.filter((t) => t.status === 'in_progress').length}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Active Trips</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              96.4%
            </span>
            <span className="text-xs text-slate-400 block mt-1">Fleet Safety Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}

