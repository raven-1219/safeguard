'use client';

import React from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Bus,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { mockDb } from '@/lib/supabase/mockStore';

export default function SafetyReportsPage() {
  const { t } = useLanguage();
  const trip = mockDb.trips[0];
  const driver = mockDb.profiles[0];
  const vehicle = mockDb.vehicles[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportData = `SAFE GUARD - OFFICIAL TRANSIT DRIVER SAFETY REPORT
==============================================================
Trip Reference ID: ${trip.id}
Date Generated: ${new Date().toLocaleString()}
Route: ${trip.route_name}

DRIVER INFORMATION:
-------------------
Driver Name: ${driver.full_name}
Email: ${driver.email}
Phone: ${driver.phone}

VEHICLE INFORMATION:
--------------------
Vehicle Plate: ${vehicle.plate_number}
Make / Model: ${vehicle.make} ${vehicle.model}
Odometer: ${vehicle.current_odometer_km} km

SAFETY TELEMETRY & AUDIT:
-------------------------
Overall Trip Safety Grade: 96.0% (EXCELLENT / ALERT)
Total Drowsiness Incidents: 1 (Resolved immediately with audio chime)
High Drowsiness / Sleep: 0
Distraction Incidents: 1
Seat Belt Compliance: 100%
Medical Emergencies: 0

CONCLUSION:
-----------
Driver maintained compliance with public transit safety standards.
Audited and verified by SAFE GUARD AI Telemetry Engine.
`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAFE_GUARD_Report_${trip.id.slice(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">{t.reports.safetyReport}</h1>
          <p className="text-xs text-slate-400">
            Official Public Transportation Telemetry & Compliance Certificate
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reports.printReport}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-sky-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Official File</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Certificate Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-sm">
                SG
              </span>
              <span className="font-extrabold text-lg text-white print:text-black">SAFE GUARD</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
              Department of Public Transit Safety & Fleet Telemetry
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs text-slate-400 block">ID: {trip.id}</span>
            <span className="text-[11px] text-slate-500 block">
              Issued: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Driver & Trip Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2 bg-slate-950/60 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300">
            <h4 className="font-bold text-sky-400 print:text-sky-800 uppercase text-[10px]">
              Driver Information
            </h4>
            <p className="text-white print:text-black font-semibold text-sm">{driver.full_name}</p>
            <p className="text-slate-400 print:text-slate-700">Email: {driver.email}</p>
            <p className="text-slate-400 print:text-slate-700">Phone: {driver.phone}</p>
          </div>

          <div className="space-y-2 bg-slate-950/60 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300">
            <h4 className="font-bold text-sky-400 print:text-sky-800 uppercase text-[10px]">
              Vehicle & Route Telemetry
            </h4>
            <p className="text-white print:text-black font-mono font-bold text-sm">
              {vehicle.plate_number}
            </p>
            <p className="text-slate-400 print:text-slate-700">
              Bus: {vehicle.make} {vehicle.model}
            </p>
            <p className="text-slate-400 print:text-slate-700">Route: {trip.route_name}</p>
          </div>
        </div>

        {/* Safety Score Highlight Box */}
        <div className="bg-emerald-950/30 print:bg-emerald-50 border border-emerald-800/40 print:border-emerald-300 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider block">
              Trip Safety Compliance Grade
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 print:text-emerald-700">
              96.0 / 100
            </span>
            <p className="text-xs text-slate-300 print:text-slate-700 mt-1">
              Rating: <strong>GRADE A (ALERT & ATTENTIVE)</strong>
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 print:bg-emerald-200 flex items-center justify-center text-emerald-400 print:text-emerald-800">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>

        {/* Incident Summary Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-white print:text-black uppercase">
            Logged Safety Incidents & Telemetry
          </h4>
          <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
            <thead className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-700">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Count</th>
                <th className="p-3">Average Duration</th>
                <th className="p-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-300">
              <tr>
                <td className="p-3 font-medium">Eye Closure / Drowsiness</td>
                <td className="p-3 font-mono">1</td>
                <td className="p-3">0.8 seconds</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">PASS</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Gaze Distraction / Looking Away</td>
                <td className="p-3 font-mono">1</td>
                <td className="p-3">1.2 seconds</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">PASS</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Seat Belt Compliance</td>
                <td className="p-3 font-mono">0 Violations</td>
                <td className="p-3">Continuous</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">PASS</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Medical / Pose Collapse Alerts</td>
                <td className="p-3 font-mono">0</td>
                <td className="p-3">None</td>
                <td className="p-3 text-emerald-400 print:text-emerald-700 font-semibold">PASS</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Official Sign-Off Footer */}
        <div className="pt-8 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-xs text-slate-500 print:text-slate-600">
          <div>
            <p>Certified by SAFE GUARD Automated Safety Telemetry System</p>
            <p className="font-mono text-[10px]">Hash: 8bfa92c4819d20c571994801a</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-300 print:text-black">Transit Safety Director</p>
            <p className="text-[10px]">Digital Signature Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}

