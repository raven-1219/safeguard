'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bus, Navigation, MapPin, Gauge, ShieldAlert, AlertCircle, Play, Pause } from 'lucide-react';
import { Vehicle, Trip, DriverSafetyState } from '@/lib/types';
import { mockDb } from '@/lib/supabase/mockStore';

interface LiveFleetMapProps {
  vehicles?: Vehicle[];
  trips?: Trip[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicleId: string) => void;
  centerCoordinates?: [number, number];
  zoom?: number;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({
  vehicles = mockDb.vehicles,
  trips = mockDb.trips,
  selectedVehicleId,
  onSelectVehicle,
  centerCoordinates = [17.385, 78.4867], // Hyderabad Metro Bus Corridor
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);

  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'seeking' | 'granted' | 'denied' | 'unsupported'>('seeking');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(38);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);

  // Demo fleet corridor waypoints (Hyderabad Metro Sector 4)
  const [fleetPositions, setFleetPositions] = useState<Record<string, [number, number]>>({
    [mockDb.vehicles[0]?.id || 'v1']: [17.385, 78.4867],
    [mockDb.vehicles[1]?.id || 'v2']: [17.401, 78.472],
    [mockDb.vehicles[2]?.id || 'v3']: [17.362, 78.501],
  });

  // 1. Browser Geolocation API request (Laptop-based location)
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('granted');
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.log('Laptop GPS notice:', err.message);
        setGpsStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // 2. Leaflet Map setup
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const initialCenter = userCoords || centerCoordinates;
        const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLeafletReady(true);
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Plot real laptop GPS pin if available
      if (userCoords) {
        const userIcon = L.divIcon({
          className: 'custom-laptop-marker',
          html: `
            <div style="
              background: #0284c7;
              color: white;
              border: 3px solid #ffffff;
              box-shadow: 0 0 16px rgba(2, 132, 199, 0.8);
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            ">
              💻
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userCoords);
        } else {
          userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(map);
          userMarkerRef.current.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
              <strong style="color: #0284c7;">Laptop Terminal / Station Location</strong>
              <p style="margin: 2px 0;">Lat: ${userCoords[0].toFixed(4)}, Lng: ${userCoords[1].toFixed(4)}</p>
              <p style="margin: 2px 0; color: #10b981;">Source: Browser Geolocation API</p>
            </div>
          `);
        }
      }

      // Plot fleet vehicles (Clearly labeled as Demo Route Waypoints)
      vehicles.forEach((v) => {
        const coords = fleetPositions[v.id] || centerCoordinates;
        const activeTrip = trips.find((t) => t.vehicle_id === v.id && t.status === 'in_progress');
        const isSelected = selectedVehicleId === v.id;

        const customIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="
              background: ${v.status === 'active' ? '#0284c7' : '#eab308'};
              color: white;
              border: 3px solid ${isSelected ? '#ffffff' : '#0f172a'};
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1.0)'};
              transition: all 0.2s ease;
            ">
              🚌
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (markersRef.current[v.id]) {
          markersRef.current[v.id].setLatLng(coords);
        } else {
          const marker = L.marker(coords, { icon: customIcon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
              <div style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 4px;">
                DEMO TRANSIT ROUTE WAYPOINT
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0284c7;">
                ${v.plate_number}
              </h4>
              <p style="margin: 2px 0;"><strong>Bus:</strong> ${v.make} ${v.model}</p>
              <p style="margin: 2px 0;"><strong>Status:</strong> ${v.status.toUpperCase()}</p>
              ${
                activeTrip
                  ? `<p style="margin: 2px 0; color: #10b981;"><strong>Active Route:</strong> ${activeTrip.route_name}</p>`
                  : '<p style="margin: 2px 0; color: #64748b;">Parked (Off Duty)</p>'
              }
            </div>
          `);

          marker.on('click', () => {
            if (onSelectVehicle) onSelectVehicle(v.id);
          });

          markersRef.current[v.id] = marker;
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [vehicles, trips, selectedVehicleId, centerCoordinates, zoom, userCoords, fleetPositions, onSelectVehicle]);

  // Demo route waypoint animation loop
  useEffect(() => {
    let timer: any = null;
    if (isSimulatingMovement) {
      timer = setInterval(() => {
        setFleetPositions((prev) => {
          const updated: Record<string, [number, number]> = {};
          Object.keys(prev).forEach((id, idx) => {
            const [lat, lng] = prev[id];
            // Slow orbital waypoint progression around transit corridor
            const deltaLat = Math.sin(Date.now() / 4000 + idx) * 0.0006;
            const deltaLng = Math.cos(Date.now() / 4000 + idx) * 0.0006;
            updated[id] = [lat + deltaLat, lng + deltaLng];
          });
          return updated;
        });
        setCurrentSpeed((prev) => Math.min(55, Math.max(28, prev + Math.floor((Math.random() - 0.5) * 4))));
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isSimulatingMovement]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
      {/* Map Header Strip */}
      <div className="p-3 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white">Live OpenStreetMap Telemetry</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-800">
            {vehicles.length} Vehicles Plotted
          </span>
        </div>

        {/* GPS Status & Demonstration Controls */}
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              gpsStatus === 'granted'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/60 text-amber-400 border-amber-800'
            }`}
          >
            {gpsStatus === 'granted'
              ? 'Laptop GPS Active'
              : 'Laptop GPS: Denied/Off (Demo Route Mode)'}
          </span>

          <button
            type="button"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 border transition-all ${
              isSimulatingMovement
                ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isSimulatingMovement ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isSimulatingMovement ? 'Pause Route' : 'Simulate Route Transit'}</span>
          </button>

          <div className="flex items-center space-x-1 font-mono text-slate-300 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-[420px] z-0" />
    </div>
  );
};
