'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Bus,
  Search,
  Filter,
  CheckCircle,
  MapPin,
  Clock,
  Eye,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockStore';
import { LiveFleetMap } from '@/components/maps/LiveFleetMap';
import { EmergencyModal } from '@/components/alerts/EmergencyModal';
import { SafetyAnalytics } from '@/components/analytics/SafetyAnalytics';
import { EmergencyEvent, MonitoringEvent, Profile, Vehicle, DriverSafetyState } from '@/lib/types';

export default function ModeratorDashboardPage() {
  const { t } = useLanguage();
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'fleet' | 'analytics'>('fleet');
  const [filterState, setFilterState] = useState<'ALL' | 'ALERT' | 'DROWSY' | 'HIGHLY DROWSY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyEvent | null>(null);

  // Real-time data lists
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [monitoringStream, setMonitoringStream] = useState<MonitoringEvent[]>([]);

  // Assigned Driver mock states
  const [driverStates, setDriverStates] = useState<
    Record<string, { state: DriverSafetyState; score: number; lastPing: string }>
  >({
    'd1111111-1111-1111-1111-111111111111': {
      state: 'ALERT',
      score: 96,
      lastPing: 'Just now',
    },
    'd2222222-2222-2222-2222-222222222222': {
      state: 'DROWSY',
      score: 72,
      lastPing: '20s ago',
    },
  });

  useEffect(() => {
    // Load drivers assigned to moderator
    setDrivers(mockDb.profiles.filter((p) => p.role === 'driver'));
    setEmergencies(mockDb.emergencyEvents);
    setMonitoringStream(mockDb.monitoringEvents.slice(0, 15));

    // Subscribe to realtime database broadcast
    const unsub = mockDb.subscribe((event, payload) => {
      if (event === 'emergency_events:INSERT') {
        setEmergencies((prev) => [payload, ...prev]);
        setSelectedEmergency(payload); // Auto trigger emergency modal
      } else if (event === 'emergency_events:UPDATE') {
        setEmergencies((prev) => prev.map((e) => (e.id === payload.id ? payload : e)));
      } else if (event === 'monitoring_events:INSERT') {
        setMonitoringStream((prev) => [payload, ...prev.slice(0, 14)]);
        setDriverStates((prev) => ({
          ...prev,
          [payload.driver_id]: {
            state: payload.safety_state,
            score: payload.safety_state === 'ALERT' ? 95 : payload.safety_state === 'DROWSY' ? 70 : 40,
            lastPing: 'Just now',
          },
        }));
      }
    });

    return () => unsub();
  }, []);

  // Filtered drivers
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase());

    const driverSafety = driverStates[driver.id]?.state || 'ALERT';
    const matchesFilter = filterState === 'ALL' || driverSafety === filterState;

    return matchesSearch && matchesFilter;
  });

  // KPI Calculations
  const totalAssigned = drivers.length;
  const activeCount = drivers.length;
  const alertCount = drivers.filter((d) => (driverStates[d.id]?.state || 'ALERT') === 'ALERT').length;
  const drowsyCount = drivers.filter((d) => driverStates[d.id]?.state === 'DROWSY').length;
  const dangerCount = drivers.filter((d) => driverStates[d.id]?.state === 'HIGHLY DROWSY').length;
  const activeEmergenciesCount = emergencies.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Moderator Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h1 className="text-xl font-black text-white">{t.nav.moderatorPortal}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
              Sector 4 Group (10–50 Assigned)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervising Moderator: <strong className="text-white">{user?.full_name || 'Priya Sharma'}</strong>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'fleet' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Assigned Drivers & Map
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Group Safety Analytics
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.moderator.assignedDrivers}
          </span>
          <span className="text-2xl font-black text-white">{totalAssigned}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.moderator.activeDrivers}
          </span>
          <span className="text-2xl font-black text-sky-400">{activeCount}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-emerald-400 block font-medium uppercase">
            {t.moderator.alertCount}
          </span>
          <span className="text-2xl font-black text-emerald-400">{alertCount}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-amber-400 block font-medium uppercase">
            {t.moderator.drowsyCount}
          </span>
          <span className="text-2xl font-black text-amber-400">{drowsyCount}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-rose-400 block font-medium uppercase">
            {t.moderator.dangerCount}
          </span>
          <span className="text-2xl font-black text-rose-400">{dangerCount}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-rose-400 block font-medium uppercase">
            {t.moderator.activeEmergencies}
          </span>
          <span className="text-2xl font-black text-rose-500 animate-pulse">
            {activeEmergenciesCount}
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'fleet' ? (
        <div className="space-y-6">
          {/* OpenStreetMap GPS Visualization */}
          <LiveFleetMap vehicles={mockDb.vehicles} trips={mockDb.trips} />

          {/* Assigned Driver Grid with Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search driver name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* State Filter Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'ALERT', 'DROWSY', 'HIGHLY DROWSY'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterState(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      filterState === filter
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => {
                const info = driverStates[driver.id] || { state: 'ALERT', score: 96, lastPing: '1m ago' };
                const vehicle = mockDb.vehicles[0];

                return (
                  <div
                    key={driver.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{driver.full_name}</h4>
                        <span className="text-[11px] text-slate-400">{driver.email}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          info.state === 'HIGHLY DROWSY'
                            ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                            : info.state === 'DROWSY'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        }`}
                      >
                        {info.state}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Bus:</span>
                        <span className="font-mono text-sky-400 font-bold">{vehicle.plate_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Safety Score:</span>
                        <span className="font-mono font-bold text-white">{info.score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Telemetry Ping:</span>
                        <span className="text-slate-400">{info.lastPing}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>GPS Live</span>
                      </span>
                      <button
                        onClick={() => {
                          // Simulate emergency event inspection
                          const mockEmerg: EmergencyEvent = {
                            id: 'em-test-' + driver.id.slice(0, 5),
                            driver_id: driver.id,
                            event_type: 'suspected_collapse',
                            severity: 'critical',
                            status: 'active',
                            trigger_source: 'mediapipe_pose',
                            description: `Suspected Sudden Collapse reported for driver ${driver.full_name}`,
                            timestamp: new Date().toISOString(),
                          };
                          setSelectedEmergency(mockEmerg);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700"
                      >
                        Inspect Feed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Emergency Events Stream */}
          {emergencies.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Emergency Broadcast Incidents</span>
              </h3>

              <div className="space-y-2">
                {emergencies.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{ev.description}</span>
                      <span className="text-[10px] text-slate-400">
                        Trigger: {ev.trigger_source} | Timestamp: {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ev.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {ev.status}
                      </span>
                      <button
                        onClick={() => setSelectedEmergency(ev)}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Analytics Tab */
        <SafetyAnalytics />
      )}

      {/* Emergency Acknowledge / Resolve Modal */}
      <EmergencyModal
        event={selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
        currentUserId={user?.id || 'm1111111-1111-1111-1111-111111111111'}
        onResolved={(updated) => {
          setEmergencies((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        }}
      />
    </div>
  );
}

