'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, X, Clock, MapPin, User, FileText } from 'lucide-react';
import { EmergencyEvent } from '@/lib/types';
import { mockDb } from '@/lib/supabase/mockStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface EmergencyModalProps {
  event: EmergencyEvent | null;
  onClose: () => void;
  onResolved?: (updatedEvent: EmergencyEvent) => void;
  currentUserId: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  event,
  onClose,
  onResolved,
  currentUserId,
}) => {
  const { t } = useLanguage();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleAcknowledge = () => {
    setIsSubmitting(true);
    const updated = mockDb.updateEmergencyStatus(event.id, 'acknowledged', currentUserId);
    setIsSubmitting(false);
    if (updated && onResolved) {
      onResolved(updated);
    }
  };

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes before marking as resolved.');
      return;
    }
    setIsSubmitting(true);
    const updated = mockDb.updateEmergencyStatus(
      event.id,
      'resolved',
      currentUserId,
      resolutionNotes
    );
    setIsSubmitting(false);
    if (updated && onResolved) {
      onResolved(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-4 bg-rose-950/80 border-b border-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                {t.emergencies.medicalEmergency}
              </h3>
              <span className="text-[11px] font-mono text-rose-300 uppercase">
                Status: {event.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <p className="text-slate-300 font-medium text-sm mb-1">{event.description}</p>
            <div className="flex items-center space-x-4 text-slate-400 text-[11px] mt-2">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Lat: {event.latitude || '17.385'}, Lng: {event.longitude || '78.486'}</span>
              </span>
            </div>
          </div>

          {/* Acknowledgement Status Indicator */}
          {event.acknowledged_at && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900">
              <CheckCircle className="w-4 h-4" />
              <span>
                Acknowledged by Moderator at {new Date(event.acknowledged_at).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Resolution Notes Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.emergencies.resolutionNotes}</span>
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Record immediate actions taken (e.g., contacted driver via radio, dispatched secondary driver, medical assistance called)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-end space-x-3">
          {event.status === 'active' && (
            <button
              onClick={handleAcknowledge}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
            >
              {t.emergencies.acknowledge}
            </button>
          )}

          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.emergencies.resolve}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

