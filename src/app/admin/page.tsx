'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Bus,
  Activity,
  PlusCircle,
  Download,
  FileText,
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Link as LinkIcon,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockStore';
import { LiveFleetMap } from '@/components/maps/LiveFleetMap';
import { SafetyAnalytics } from '@/components/analytics/SafetyAnalytics';
import { Vehicle, Profile, AuditLog, GroupMember, VehicleAssignment } from '@/lib/types';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'vehicles' | 'assignments' | 'audits'>('overview');

  // Interactive Form States
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');

  const [newPlate, setNewPlate] = useState('');
  const [newMake, setNewMake] = useState('Ashok Leyland');
  const [newModel, setNewModel] = useState('Viking City Bus');
  const [newCapacity, setNewCapacity] = useState(48);

  // Assignment form states
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Local state references
  const [driversList, setDriversList] = useState<Profile[]>(
    mockDb.profiles.filter((p) => p.role === 'driver')
  );
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(mockDb.vehicles);
  const [assignmentsList, setAssignmentsList] = useState<VehicleAssignment[]>(mockDb.vehicleAssignments);

  // Add Driver Action
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverEmail) return;

    const newDriver: Profile = {
      id: 'd-' + Math.random().toString(36).substring(2, 9),
      email: newDriverEmail,
      full_name: newDriverName,
      phone: newDriverPhone || '+91 98480 00000',
      role: 'driver',
      preferred_language: 'en',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.profiles.push(newDriver);
    setDriversList((prev) => [...prev, newDriver]);

    mockDb.auditLogs.unshift({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id,
      action: 'DRIVER_REGISTERED',
      resource: `Profile: ${newDriver.full_name}`,
      timestamp: new Date().toISOString(),
    });

    setNewDriverName('');
    setNewDriverEmail('');
    setNewDriverPhone('');
    setShowAddDriverModal(false);
  };

  // Add Vehicle Action
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate) return;

    const newVehicle: Vehicle = {
      id: 'v-' + Math.random().toString(36).substring(2, 9),
      plate_number: newPlate,
      make: newMake,
      model: newModel,
      year: 2024,
      capacity: newCapacity,
      status: 'active',
      current_odometer_km: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.vehicles.push(newVehicle);
    setVehiclesList((prev) => [...prev, newVehicle]);

    mockDb.auditLogs.unshift({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id,
      action: 'VEHICLE_REGISTERED',
      resource: `Vehicle: ${newVehicle.plate_number}`,
      timestamp: new Date().toISOString(),
    });

    setNewPlate('');
    setShowAddVehicleModal(false);
  };

  // Handle Driver to Vehicle Assignment
  const handleAssignVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId) return;

    const newAssignment: VehicleAssignment = {
      id: 'va-' + Math.random().toString(36).substring(2, 9),
      driver_id: selectedDriverId,
      vehicle_id: selectedVehicleId,
      start_time: new Date().toISOString(),
      is_active: true,
      assigned_by: user?.id,
      created_at: new Date().toISOString(),
    };

    mockDb.vehicleAssignments.unshift(newAssignment);
    setAssignmentsList((prev) => [newAssignment, ...prev]);

    mockDb.auditLogs.unshift({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id,
      action: 'VEHICLE_ASSIGNMENT_CREATED',
      resource: `Driver: ${selectedDriverId} -> Vehicle: ${selectedVehicleId}`,
      timestamp: new Date().toISOString(),
    });

    setShowAssignModal(false);
  };

  // CSV Report Generator (Actual file download)
  const handleExportCSV = () => {
    const headers = [
      'Trip_ID',
      'Driver_Name',
      'Vehicle_Plate',
      'Route',
      'Start_Time',
      'Status',
      'Safety_Score',
      'Drowsiness_Incidents',
      'Distractions',
      'SeatBelt_Warnings',
    ];

    const rows = mockDb.trips.map((trip) => {
      const driver = mockDb.profiles.find((p) => p.id === trip.driver_id);
      const vehicle = mockDb.vehicles.find((v) => v.id === trip.vehicle_id);
      return [
        trip.id,
        driver?.full_name || 'Driver',
        vehicle?.plate_number || 'AP 29 TA 4421',
        `"${trip.route_name}"`,
        trip.start_time,
        trip.status,
        trip.final_safety_score,
        '1',
        '1',
        '0',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAFE_GUARD_Fleet_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-black text-white">{t.admin.fleetOverview}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              Admin Master Console
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-white">{user?.full_name || 'Transit Safety Director'}</strong>
          </p>
        </div>

        {/* Global Export & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-sky-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Safety CSV</span>
          </button>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {(['overview', 'drivers', 'vehicles', 'assignments', 'audits'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  activeTab === tab ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.admin.totalDrivers}
          </span>
          <span className="text-2xl font-black text-white">{driversList.length}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.admin.totalModerators}
          </span>
          <span className="text-2xl font-black text-amber-400">
            {mockDb.profiles.filter((p) => p.role === 'moderator').length}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.admin.totalVehicles}
          </span>
          <span className="text-2xl font-black text-sky-400">{vehiclesList.length}</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">
            {t.admin.activeTripsCount}
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {mockDb.trips.filter((t) => t.status === 'in_progress').length}
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-emerald-400 block font-medium uppercase">
            {t.admin.orgSafetyIndex}
          </span>
          <span className="text-2xl font-black text-emerald-400">96.8%</span>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <LiveFleetMap vehicles={vehiclesList} trips={mockDb.trips} />
          <SafetyAnalytics />
        </div>
      )}

      {/* Drivers Tab Content */}
      {activeTab === 'drivers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Driver Registry</h3>
            <button
              onClick={() => setShowAddDriverModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.admin.addDriver}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Driver Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Preferred Lang</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {driversList.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-semibold text-white">{driver.full_name}</td>
                    <td className="p-3 font-mono">{driver.email}</td>
                    <td className="p-3">{driver.phone || 'N/A'}</td>
                    <td className="p-3 uppercase font-bold text-sky-400">{driver.preferred_language}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicles Tab Content */}
      {activeTab === 'vehicles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Public Transportation Bus Fleet</h3>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.admin.addVehicle}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">License Plate</th>
                  <th className="p-3">Make / Model</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Odometer</th>
                  <th className="p-3">Fleet Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vehiclesList.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-mono font-bold text-sky-400">{bus.plate_number}</td>
                    <td className="p-3 font-semibold text-white">
                      {bus.make} {bus.model}
                    </td>
                    <td className="p-3">{bus.year}</td>
                    <td className="p-3">{bus.capacity} seats</td>
                    <td className="p-3 font-mono">{bus.current_odometer_km.toLocaleString()} km</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bus.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments Tab Content (Section 3C) */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Driver-to-Vehicle & Fleet Assignments</h3>
              <p className="text-xs text-slate-400">
                Manage pairing between drivers, vehicles, and supervising moderator groups.
              </p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Assign Driver to Bus</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Assignment ID</th>
                  <th className="p-3">Driver Name</th>
                  <th className="p-3">Vehicle Plate</th>
                  <th className="p-3">Assigned Since</th>
                  <th className="p-3">Assignment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assignmentsList.map((assign) => {
                  const driver = mockDb.profiles.find((p) => p.id === assign.driver_id);
                  const bus = mockDb.vehicles.find((v) => v.id === assign.vehicle_id);
                  return (
                    <tr key={assign.id} className="hover:bg-slate-850/50">
                      <td className="p-3 font-mono text-slate-400">{assign.id.slice(0, 12)}</td>
                      <td className="p-3 font-bold text-white">
                        {driver?.full_name || 'Assigned Driver'}
                      </td>
                      <td className="p-3 font-mono text-sky-400 font-bold">
                        {bus?.plate_number || 'AP 29 TA 4421'}
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(assign.start_time).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          ACTIVE ON ROUTE
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab Content */}
      {activeTab === 'audits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">{t.admin.auditLogs}</h3>
            <span className="text-xs text-slate-400">Security & Tamper-Evident Records</span>
          </div>

          <div className="space-y-2">
            {mockDb.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-sky-400">{log.action}</span>
                  <span className="text-slate-300 ml-2">{log.resource}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-[11px] font-mono">
                  <span>IP: 192.168.1.102</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddDriver}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="text-base font-bold text-white mb-2">{t.admin.addDriver}</h3>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t.forms.fullName}</label>
              <input
                type="text"
                required
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="e.g. Anand Reddy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t.forms.email}</label>
              <input
                type="email"
                required
                value={newDriverEmail}
                onChange={(e) => setNewDriverEmail(e.target.value)}
                placeholder="e.g. anand.reddy@safeguard.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Phone Number</label>
              <input
                type="text"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                placeholder="+91 98480 11223"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddDriverModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.forms.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {t.forms.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <form
          onSubmit={handleAddVehicle}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t.admin.addVehicle}</h3>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t.forms.plateNumber}</label>
              <input
                type="text"
                required
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                placeholder="AP 29 TA 9988"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t.forms.make}</label>
              <input
                type="text"
                required
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t.forms.model}</label>
              <input
                type="text"
                required
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.forms.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {t.forms.submit}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Assign Vehicle Modal Dialog */}
      {showAssignModal && (
        <form
          onSubmit={handleAssignVehicle}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Assign Driver to Bus</h3>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Select Driver</label>
              <select
                required
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="">-- Choose Driver --</option>
                {driversList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Select Vehicle Bus</label>
              <select
                required
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="">-- Choose Bus --</option>
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} - {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.forms.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
