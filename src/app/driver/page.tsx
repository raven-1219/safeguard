'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  MapPin,
  Clock,
  Gauge,
  Play,
  Square,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Compass,
  Boxes,
  Eye,
  Smile,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockStore';
import { CameraFeed } from '@/components/ai/CameraFeed';
import { WebcamPostureMonitor } from '@/components/ai/WebcamPostureMonitor';
import { HeadPose3DGimbal } from '@/components/ai/HeadPose3DGimbal';
import { LiveAITelemetry, PoseEmergencyTelemetry, Trip, MonitoringEvent } from '@/lib/types';
import { offlineSyncManager } from '@/lib/offline/syncQueue';

export default function DriverDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const driverId = user?.id || 'd1111111-1111-1111-1111-111111111111';

  // Active Trip State
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripElapsedSeconds, setTripElapsedSeconds] = useState<number>(7200); // 2 hours nominal
  const [isTripActive, setIsTripActive] = useState<boolean>(true);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<LiveAITelemetry | null>(null);
  const [poseData, setPoseData] = useState<PoseEmergencyTelemetry | null>(null);
  const [eventsHistory, setEventsHistory] = useState<MonitoringEvent[]>([]);

  // Assigned Vehicle
  const assignedVehicle = mockDb.vehicles[0];

  useEffect(() => {
    // Find active trip for this driver
    const foundTrip = mockDb.trips.find(
      (t) => t.driver_id === driverId && t.status === 'in_progress'
    );
    if (foundTrip) {
      setActiveTrip(foundTrip);
      setIsTripActive(true);
    } else {
      setActiveTrip(mockDb.trips[0]);
    }

    // Subscribe to realtime events
    const unsub = mockDb.subscribe((event, payload) => {
      if (event === 'monitoring_events:INSERT' && payload.driver_id === driverId) {
        setEventsHistory((prev) => [payload, ...prev.slice(0, 9)]);
      }
    });

    return () => unsub();
  }, [driverId]);

  // Trip timer
  useEffect(() => {
    let interval: any = null;
    if (isTripActive) {
      interval = setInterval(() => {
        setTripElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTripActive]);

  const handleStartTrip = () => {
    setIsTripActive(true);
    const newTrip: Trip = {
      id: 't-' + Math.random().toString(36).substring(2, 9),
      driver_id: driverId,
      vehicle_id: assignedVehicle.id,
      route_name: 'Metro Feeder Line 9',
      start_location: 'Central Depot Gate 3',
      start_time: new Date().toISOString(),
      status: 'in_progress',
      total_distance_km: 0.1,
      average_speed_kmh: 0.0,
      final_safety_score: 100.0,
      created_at: new Date().toISOString(),
    };
    mockDb.trips.unshift(newTrip);
    setActiveTrip(newTrip);
    setTripElapsedSeconds(0);
  };

  const handleEndTrip = () => {
    if (activeTrip) {
      activeTrip.status = 'completed';
      activeTrip.end_time = new Date().toISOString();
      activeTrip.final_safety_score = telemetry ? telemetry.safetyScore : 95;
    }
    setIsTripActive(false);
  };

  const handleEmergencyTrigger = (type: string, desc: string) => {
    offlineSyncManager.enqueue('emergency', {
      trip_id: activeTrip?.id,
      driver_id: driverId,
      event_type: type,
      severity: 'critical',
      trigger_source: 'webcam_posture_detector',
      description: desc,
      latitude: 17.385,
      longitude: 78.4867,
      timestamp: new Date().toISOString(),
    });
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDirection = (yaw: number, pitch: number): 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP' => {
    if (yaw < -14) return 'LEFT';
    if (yaw > 14) return 'RIGHT';
    if (pitch < -10) return 'DOWN';
    if (pitch > 14) return 'UP';
    return 'CENTER';
  };

  const headDirection = getDirection(telemetry?.yaw || 0, telemetry?.pitch || 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{t.nav.driverPortal}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono font-normal">
                COCKPIT HUD v1.2
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Assigned Vehicle: <span className="text-white font-semibold">{assignedVehicle?.plate_number}</span> ({assignedVehicle?.make} {assignedVehicle?.model})
          </p>
        </div>

        {/* Action Controls & Session Timer */}
        <div className="flex items-center space-x-3">
          {isTripActive ? (
            <button
              onClick={handleEndTrip}
              className="px-5 py-2.5 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.hud.endTrip}</span>
            </button>
          ) : (
            <button
              onClick={handleStartTrip}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.hud.startTrip}</span>
            </button>
          )}

          <div className="bg-slate-950/80 border border-slate-800/90 px-3.5 py-2 rounded-2xl text-xs font-mono flex items-center space-x-2 text-slate-300 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formatDuration(tripElapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Camera HUD on Left, 3D Gimbal & Cockpit Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time Computer Vision Camera Feed & Posture Detector */}
        <div className="lg:col-span-7 space-y-6">
          <CameraFeed
            driverId={driverId}
            tripId={activeTrip?.id}
            onTelemetryUpdate={(tel, pose) => {
              setTelemetry(tel);
              setPoseData(pose);
            }}
          />

          {/* Webcam-Based Upper Body Posture & Collapse Monitor */}
          <WebcamPostureMonitor
            telemetry={poseData}
            isTripActive={isTripActive}
            onTriggerTestEmergency={handleEmergencyTrigger}
          />
        </div>

        {/* Right Column: 3D Head Gimbal Hologram, Biometric Gauges & Event Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-Time 3D Holographic Head Pose Gimbal */}
          <HeadPose3DGimbal
            pitch={telemetry?.pitch || 0}
            yaw={telemetry?.yaw || 0}
            roll={telemetry?.roll || 0}
            direction={headDirection}
            isDistracted={telemetry?.isDistracted || false}
          />

          {/* Safety Status & Score Bar */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between font-mono">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>ALERTNESS INDEX</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                  telemetry?.state === 'HIGHLY DROWSY'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                    : telemetry?.state === 'DROWSY'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}
              >
                {telemetry?.state || 'ALERT'}
              </span>
            </h3>

            {/* Score Bar */}
            <div className="space-y-1.5 mb-3 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Composite Score</span>
                <span className="font-bold text-white text-sm">
                  {telemetry ? telemetry.safetyScore : 98}%
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/90 shadow-inner">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    (telemetry?.safetyScore || 98) < 50
                      ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                      : (telemetry?.safetyScore || 98) < 75
                      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  }`}
                  style={{ width: `${telemetry?.safetyScore || 98}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {telemetry?.state === 'HIGHLY DROWSY'
                ? t.safetyStates.dangerDescription
                : telemetry?.state === 'DROWSY'
                ? t.safetyStates.drowsyDescription
                : t.safetyStates.safeDescription}
            </p>
          </div>

          {/* Biometric Micro-Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-xl">
              <span className="text-slate-400 text-[10px] block uppercase flex items-center space-x-1.5 mb-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Eye State</span>
              </span>
              <span className={`text-base font-bold ${telemetry?.isEyesClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {telemetry?.isEyesClosed ? 'CLOSED' : 'OPEN'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                EAR: {telemetry ? Math.round(telemetry.ear * 1000) / 1000 : '0.29'}
              </span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-xl">
              <span className="text-slate-400 text-[10px] block uppercase flex items-center space-x-1.5 mb-1">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Mouth / Yawn</span>
              </span>
              <span className={`text-base font-bold ${telemetry?.isYawning ? 'text-rose-400' : 'text-cyan-400'}`}>
                {telemetry?.isYawning ? 'YAWNING' : 'NORMAL'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                MAR: {telemetry ? Math.round(telemetry.mar * 1000) / 1000 : '0.22'}
              </span>
            </div>
          </div>

          {/* Active Trip Telemetry Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="font-bold text-sm text-white mb-3 font-mono flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE TRANSIT ROUTE</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Route Assigned</span>
                <span className="font-semibold text-white">
                  {activeTrip?.route_name || 'Corridor 4 Express'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Origin Depot</span>
                <span className="font-semibold text-slate-300">
                  {activeTrip?.start_location || 'Central Terminal'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Odometer Distance</span>
                <span className="text-cyan-400 font-bold">24.6 km</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Seat Belt Status</span>
                <span
                  className={`font-bold uppercase ${
                    telemetry?.seatBeltStatus === 'FASTENED'
                      ? 'text-emerald-400'
                      : telemetry?.seatBeltStatus === 'UNFASTENED'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {telemetry?.seatBeltStatus || 'FASTENED'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Safety Warnings Log */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2 font-mono">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>INCIDENT LOG</span>
            </h3>

            <div className="space-y-2">
              {eventsHistory.length === 0 ? (
                <div className="p-4 bg-slate-950/80 rounded-2xl text-center border border-slate-800/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-mono">
                    Zero critical violations recorded. Driving status nominal.
                  </p>
                </div>
              ) : (
                eventsHistory.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-white block">{ev.event_type}</span>
                      <span className="text-[10px] text-slate-400">
                        EAR: {ev.ear_value} | MAR: {ev.mar_value}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
