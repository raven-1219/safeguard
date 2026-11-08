'use client';

import React from 'react';
import {
  Activity,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingDown,
  Zap,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PoseEmergencyTelemetry } from '@/lib/types';

interface WebcamPostureMonitorProps {
  telemetry: PoseEmergencyTelemetry | null;
  onTriggerTestEmergency?: (type: string, desc: string) => void;
  isTripActive?: boolean;
}

export const WebcamPostureMonitor: React.FC<WebcamPostureMonitorProps> = ({
  telemetry,
  onTriggerTestEmergency,
  isTripActive = true,
}) => {
  const { t } = useLanguage();

  const isCollapse = telemetry?.isSuspectedCollapse ?? false;
  const isAbnormalMotion = telemetry?.isAbnormalMotion ?? false;
  const isInactive = telemetry?.isProlongedInactivity ?? false;
  const headDrop = telemetry?.headDropDegrees ?? 0;
  const motionVelocity = telemetry?.motionVelocity ?? 0.02;
  const inactivitySec = telemetry?.inactivitySeconds ?? 0;

  const handleTestCollapse = () => {
    if (onTriggerTestEmergency) {
      onTriggerTestEmergency(
        'suspected_collapse',
        'Academic Demonstration: Controlled test trigger for sudden head/torso collapse displacement.'
      );
    }
  };

  const handleTestConvulsion = () => {
    if (onTriggerTestEmergency) {
      onTriggerTestEmergency(
        'abnormal_motion',
        'Academic Demonstration: Controlled test trigger for high-frequency involuntary movement pattern.'
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-sm text-white">
            Webcam Posture & Health Emergency Telemetry
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 uppercase">
          Vision-Only (Laptop Webcam)
        </span>
      </div>

      {/* Scientific Scope Notice */}
      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p>
          Monitors driver upper-body displacement, sudden vertical head drops, and stillness.
          <strong className="text-slate-300"> Note:</strong> These are suspected emergency indicators derived from optical pose geometry, not medical diagnosis.
        </p>
      </div>

      {/* 3 Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Head Drop */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isCollapse
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Torso / Head Drop
            </span>
            <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-lg font-mono font-bold block text-white">
            {headDrop}° <span className="text-xs font-normal text-slate-400">(&lt;25° nom)</span>
          </span>
          <span className="text-[10px] font-medium block mt-1">
            {isCollapse ? '⚠️ SUSPECTED COLLAPSE' : 'Normal Upright Posture'}
          </span>
        </div>

        {/* 2. Motion Velocity / Jerk */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isAbnormalMotion
              ? 'bg-amber-950/60 border-amber-600 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Kinetic Velocity
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-mono font-bold block text-white">
            {motionVelocity} <span className="text-xs font-normal text-slate-400">m/s²</span>
          </span>
          <span className="text-[10px] font-medium block mt-1">
            {isAbnormalMotion ? '⚠️ ABNORMAL JERK' : 'Natural Driving Kinetics'}
          </span>
        </div>

        {/* 3. Inactivity Timer */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isInactive
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Micro-Movement Stillness
            </span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-lg font-mono font-bold block text-white">
            {inactivitySec}s <span className="text-xs font-normal text-slate-400">(&lt;12s limit)</span>
          </span>
          <span className="text-[10px] font-medium block mt-1">
            {isInactive ? '⚠️ UNRESPONSIVE ALERT' : 'Active Micro-Movements'}
          </span>
        </div>
      </div>

      {/* Safe Academic Demonstration Test Controls */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-medium">
          Demonstration Safety Triggers:
        </span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTestCollapse}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-rose-600/20"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Suspected Collapse</span>
          </button>

          <button
            type="button"
            onClick={handleTestConvulsion}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-600/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test Abnormal Movement</span>
          </button>
        </div>
      </div>
    </div>
  );
};

