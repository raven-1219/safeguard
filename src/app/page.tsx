'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Users,
  Eye,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Boxes,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';

export default function HomePage() {
  const { t } = useLanguage();
  const { switchUser, availableUsers } = useAuth();

  const driverUser = availableUsers.find((u) => u.role === 'driver');
  const modUser = availableUsers.find((u) => u.role === 'moderator');
  const adminUser = availableUsers.find((u) => u.role === 'admin');

  return (
    <div className="space-y-14 py-8 animate-fadeIn">
      {/* Hero Section with Ambient Cyber Glow */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-slate-800/90 p-8 sm:p-14 shadow-2xl backdrop-blur-2xl">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI TRANSPORT SAFETY PLATFORM • v1.2</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans">
            SAFE GUARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">AI</span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-200 font-medium leading-relaxed font-sans">
            Intelligent Driver Fatigue, Medical Emergency & Fleet Telemetry System
          </p>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-sans">
            High-precision computer vision pipeline operating 100% locally in your laptop browser. Featuring 468-point 3D facial mesh geometry, real-time 3D head pose gimbal, pose kinetic collapse detection, and Supabase cloud fleet coordination.
          </p>

          {/* Quick Portal Action Buttons */}
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/driver"
              onClick={() => driverUser && switchUser(driverUser.id)}
              className="px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center space-x-2.5 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Driver Cockpit</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/moderator"
              onClick={() => modUser && switchUser(modUser.id)}
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 flex items-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Moderator Fleet Hub</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => adminUser && switchUser(adminUser.id)}
              className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 flex items-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Admin Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cyber Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
          <span className="text-slate-400 text-[10px] block uppercase mb-1">Vision Topology</span>
          <span className="text-lg font-bold text-cyan-400">468 3D Points</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">MediaPipe Mesh Geometry</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
          <span className="text-slate-400 text-[10px] block uppercase mb-1">Pose Tracking</span>
          <span className="text-lg font-bold text-cyan-400">3D Gimbal Matrix</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Pitch • Yaw • Roll Holo</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
          <span className="text-slate-400 text-[10px] block uppercase mb-1">Latency</span>
          <span className="text-lg font-bold text-emerald-400">&lt; 32 ms</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Zero-Lag Browser Inference</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
          <span className="text-slate-400 text-[10px] block uppercase mb-1">Data Isolation</span>
          <span className="text-lg font-bold text-emerald-400">PostgreSQL RLS</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Supabase Enterprise Auth</span>
        </div>
      </div>

      {/* Role-Based Portals Showcase */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Role-Based Transport Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated functional environments for drivers, fleet controllers, and organization administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Driver Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.12)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.driver}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Laptop webcam facial fatigue monitoring, EAR/MAR calculation, 3D head pose gimbal, posture collapse detector, and Web Audio alarms.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EAR & MAR Blink/Yawn Tracker</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive 3D Holographic Gimbal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Seat Belt Contrast Detection</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/driver"
                onClick={() => driverUser && switchUser(driverUser.id)}
                className="w-full py-3 px-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <span>Enter Driver Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Moderator Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.moderator}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervises assigned fleets of 10 to 50 public transport drivers. Live OpenStreetMap GPS tracking, real-time emergency alerts, and event acknowledgement.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Fleet Grid (10-50 Drivers)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Vehicle Telemetry Map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emergency Alert Acknowledgement</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/moderator"
                onClick={() => modUser && switchUser(modUser.id)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <span>Enter Moderator Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.roles.admin}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete institutional oversight. Driver and vehicle registrations, assignments, fleet-wide analytics, audit trail logs, and CSV report exports.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Driver & Vehicle Assignment Manager</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>System Analytics & Trends</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Regulatory Compliance CSV Export</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/admin"
                onClick={() => adminUser && switchUser(adminUser.id)}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
