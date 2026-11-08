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
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockStore';
import { CameraFeed } from '@/components/ai/CameraFeed';
import { WebcamPostureMonitor } from '@/components/ai/WebcamPostureMonitor';
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

  return (
    <div className="space-y-6">
      {/* Top Driver Header & Trip Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-black text-white">{t.nav.driverPortal}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 uppercase">
              {user?.full_name || 'Rajesh Kumar'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assigned Vehicle: <strong className="text-white">{assignedVehicle.plate_number}</strong> ({assignedVehicle.make} {assignedVehicle.model})
          </p>
        </div>

        {/* Trip Action Button */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {isTripActive ? (
            <button
              onClick={handleEndTrip}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-rose-600/20"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{t.hud.endTrip}</span>
            </button>
          ) : (
            <button
              onClick={handleStartTrip}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.hud.startTrip}</span>
            </button>
          )}

          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono flex items-center space-x-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{formatDuration(tripElapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Camera HUD on Left, Posture & Trip Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time Computer Vision Camera Feed */}
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

        {/* Right Column: Status Cards, Telemetry Indicators & Event Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Safety Status Gauge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
              <span>Driver Safety Status</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  telemetry?.state === 'HIGHLY DROWSY'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : telemetry?.state === 'DROWSY'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}
              >
                {telemetry?.state || 'ALERT'}
              </span>
            </h3>

            {/* Score Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Alertness Grade</span>
                <span className="font-bold font-mono text-white">
                  {telemetry ? telemetry.safetyScore : 98}%
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    (telemetry?.safetyScore || 98) < 50
                      ? 'bg-rose-500'
                      : (telemetry?.safetyScore || 98) < 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${telemetry?.safetyScore || 98}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {telemetry?.state === 'HIGHLY DROWSY'
                ? t.safetyStates.dangerDescription
                : telemetry?.state === 'DROWSY'
                ? t.safetyStates.drowsyDescription
                : t.safetyStates.safeDescription}
            </p>
          </div>

          {/* Active Trip Telemetry Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-3">
              {t.hud.tripStatus} Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Route Assigned</span>
                <span className="font-semibold text-white">
                  {activeTrip?.route_name || 'Corridor 4 Express'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Origin Depot</span>
                <span className="font-semibold text-slate-300">
                  {activeTrip?.start_location || 'Central Terminal'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Odometer Distance</span>
                <span className="font-mono text-sky-400 font-bold">24.6 km</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Seat Belt Status</span>
                <span
                  className={`font-semibold uppercase ${
                    telemetry?.seatBeltStatus === 'FASTENED'
                      ? 'text-emerald-400'
                      : telemetry?.seatBeltStatus === 'UNFASTENED'
                      ? 'text-rose-400 font-bold'
                      : 'text-amber-400'
                  }`}
                >
                  {telemetry?.seatBeltStatus || 'FASTENED'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Safety Warnings Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Personal Safety Events Log</span>
            </h3>

            <div className="space-y-2">
              {eventsHistory.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl text-center border border-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">
                    No critical violations recorded. Driving posture is optimal.
                  </p>
                </div>
              ) : (
                eventsHistory.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{ev.event_type}</span>
                      <span className="text-[10px] text-slate-400">
                        EAR: {ev.ear_value} | MAR: {ev.mar_value}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
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
