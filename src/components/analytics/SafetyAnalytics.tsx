'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';

interface SafetyAnalyticsProps {
  scoreHistory?: Array<{ time: string; score: number }>;
  eventStats?: {
    drowsy: number;
    highlyDrowsy: number;
    distracted: number;
    seatbeltOff: number;
    emergencies: number;
  };
}

const DEFAULT_SCORE_HISTORY = [
  { time: '08:00', score: 98 },
  { time: '08:30', score: 96 },
  { time: '09:00', score: 94 },
  { time: '09:30', score: 88 },
  { time: '10:00', score: 76 },
  { time: '10:30', score: 92 },
  { time: '11:00', score: 95 },
  { time: '11:30', score: 89 },
  { time: '12:00', score: 97 },
];

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const SafetyAnalytics: React.FC<SafetyAnalyticsProps> = ({
  scoreHistory = DEFAULT_SCORE_HISTORY,
  eventStats = { drowsy: 4, highlyDrowsy: 1, distracted: 3, seatbeltOff: 2, emergencies: 0 },
}) => {
  const barData = [
    { name: 'Drowsy', count: eventStats.drowsy, fill: '#f59e0b' },
    { name: 'Critical Fatigue', count: eventStats.highlyDrowsy, fill: '#ef4444' },
    { name: 'Distraction', count: eventStats.distracted, fill: '#3b82f6' },
    { name: 'Seat Belt Off', count: eventStats.seatbeltOff, fill: '#8b5cf6' },
    { name: 'Medical Emergency', count: eventStats.emergencies, fill: '#dc2626' },
  ];

  const pieData = [
    { name: 'Alert Driving', value: 82 },
    { name: 'Drowsy Warning', value: 14 },
    { name: 'Critical Incident', value: 4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Area Chart: Safety Score Over Time */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Trip Safety Score Trajectory</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            Current Avg: 92.4%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bar Chart: Safety Incidents Frequency */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Safety Event Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">Past 24 Hours</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

