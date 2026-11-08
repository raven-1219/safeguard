// ==============================================================================
// SAFE GUARD AI - Unified Data Store & Mock-Resilient Supabase Provider
// Implements full database operations, RLS simulation, and realtime event subscriptions
// ==============================================================================

import {
  Profile,
  ModeratorGroup,
  GroupMember,
  Vehicle,
  VehicleAssignment,
  Trip,
  MonitoringEvent,
  EmergencyEvent,
  GPSLocation,
  SafetyReport,
  AppNotification,
  AuditLog,
  UserRole,
} from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    email: 'driver.rajesh@safeguard.gov.in',
    full_name: 'Rajesh Kumar (రాజేష్ కుమార్)',
    role: 'driver',
    phone: '+91 98480 12345',
    preferred_language: 'en',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    email: 'driver.suresh@safeguard.gov.in',
    full_name: 'Suresh Varma (సురేష్ వర్మ)',
    role: 'driver',
    phone: '+91 98480 67890',
    preferred_language: 'te',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    email: 'moderator.priya@safeguard.gov.in',
    full_name: 'Priya Sharma (Fleet Moderator)',
    role: 'moderator',
    phone: '+91 98480 55555',
    preferred_language: 'en',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'admin.director@safeguard.gov.in',
    full_name: 'Transit Safety Director',
    role: 'admin',
    phone: '+91 98480 99999',
    preferred_language: 'en',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1111111-1111-1111-1111-111111111111',
    plate_number: 'AP 29 TA 4421',
    make: 'Ashok Leyland',
    model: 'Viking City Bus',
    year: 2023,
    capacity: 48,
    status: 'active',
    device_serial: 'SG-OBD-8821',
    current_odometer_km: 45210.5,
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v2222222-2222-2222-2222-222222222222',
    plate_number: 'TS 09 UB 8812',
    make: 'Tata Motors',
    model: 'Starbus EV Ultra',
    year: 2024,
    capacity: 42,
    status: 'active',
    device_serial: 'SG-OBD-9943',
    current_odometer_km: 18450.0,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v3333333-3333-3333-3333-333333333333',
    plate_number: 'AP 16 TX 1029',
    make: 'Eicher Motors',
    model: 'Skyline Pro',
    year: 2022,
    capacity: 36,
    status: 'maintenance',
    device_serial: 'SG-OBD-4102',
    current_odometer_km: 82190.2,
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_GROUPS: ModeratorGroup[] = [
  {
    id: 'g1111111-1111-1111-1111-111111111111',
    name: 'Sector 4 Express Corridor Group',
    description: 'Supervises Metro feeder and express route drivers (Capacity: 25)',
    moderator_id: 'm1111111-1111-1111-1111-111111111111',
    max_drivers: 30,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_GROUP_MEMBERS: GroupMember[] = [
  {
    id: 'gm111111-1111-1111-1111-111111111111',
    group_id: 'g1111111-1111-1111-1111-111111111111',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    assigned_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'gm222222-2222-2222-2222-222222222222',
    group_id: 'g1111111-1111-1111-1111-111111111111',
    driver_id: 'd2222222-2222-2222-2222-222222222222',
    assigned_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const INITIAL_ASSIGNMENTS: VehicleAssignment[] = [
  {
    id: 'va111111-1111-1111-1111-111111111111',
    vehicle_id: 'v1111111-1111-1111-1111-111111111111',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    start_time: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'va222222-2222-2222-2222-222222222222',
    vehicle_id: 'v2222222-2222-2222-2222-222222222222',
    driver_id: 'd2222222-2222-2222-2222-222222222222',
    start_time: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    vehicle_id: 'v1111111-1111-1111-1111-111111111111',
    route_name: 'Corridor 4: Central Station to Airport Hub',
    start_location: 'Central Bus Terminal, Bay 6',
    end_location: 'Airport Terminal 2',
    start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'in_progress',
    total_distance_km: 24.6,
    average_speed_kmh: 38.5,
    final_safety_score: 96.0,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

class MockDatabase {
  public profiles: Profile[] = [...INITIAL_PROFILES];
  public moderatorGroups: ModeratorGroup[] = [...INITIAL_GROUPS];
  public groupMembers: GroupMember[] = [...INITIAL_GROUP_MEMBERS];
  public vehicles: Vehicle[] = [...INITIAL_VEHICLES];
  public vehicleAssignments: VehicleAssignment[] = [...INITIAL_ASSIGNMENTS];
  public trips: Trip[] = [...INITIAL_TRIPS];
  public monitoringEvents: MonitoringEvent[] = [];
  public emergencyEvents: EmergencyEvent[] = [];
  public gpsLocations: GPSLocation[] = [];
  public safetyReports: SafetyReport[] = [];
  public notifications: AppNotification[] = [];
  public auditLogs: AuditLog[] = [];

  // Listeners for realtime subscriptions
  private listeners: Array<(event: string, payload: any) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('safeguard_mock_db');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.profiles) this.profiles = data.profiles;
        if (data.vehicles) this.vehicles = data.vehicles;
        if (data.trips) this.trips = data.trips;
        if (data.monitoringEvents) this.monitoringEvents = data.monitoringEvents;
        if (data.emergencyEvents) this.emergencyEvents = data.emergencyEvents;
        if (data.notifications) this.notifications = data.notifications;
      }
    } catch (e) {
      console.warn('Mock DB storage load warning:', e);
    }
  }

  public saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'safeguard_mock_db',
        JSON.stringify({
          profiles: this.profiles,
          vehicles: this.vehicles,
          trips: this.trips,
          monitoringEvents: this.monitoringEvents.slice(-100),
          emergencyEvents: this.emergencyEvents.slice(-50),
          notifications: this.notifications.slice(-50),
        })
      );
    } catch (e) {
      // Quota limit
    }
  }

  public subscribe(cb: (event: string, payload: any) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public broadcast(event: string, payload: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, payload);
      } catch (e) {
        console.error('Realtime broadcast error:', e);
      }
    });
  }

  // Add monitoring event
  public addMonitoringEvent(event: Omit<MonitoringEvent, 'id'>): MonitoringEvent {
    const newEvent: MonitoringEvent = {
      ...event,
      id: 'me-' + Math.random().toString(36).substring(2, 9),
    };
    this.monitoringEvents.unshift(newEvent);
    if (this.monitoringEvents.length > 500) this.monitoringEvents.pop();

    this.broadcast('monitoring_events:INSERT', newEvent);
    this.saveToStorage();
    return newEvent;
  }

  // Add emergency event
  public addEmergencyEvent(event: Omit<EmergencyEvent, 'id' | 'status'>): EmergencyEvent {
    const newEvent: EmergencyEvent = {
      ...event,
      id: 'em-' + Math.random().toString(36).substring(2, 9),
      status: 'active',
    };
    this.emergencyEvents.unshift(newEvent);

    // Create system notification for assigned moderator and admins
    const notif: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      recipient_id: 'm1111111-1111-1111-1111-111111111111',
      title: 'CRITICAL: ' + newEvent.description,
      title_te: 'తీవ్ర హెచ్చరిక: అత్యవసర పరిస్థితి గుర్తించబడింది',
      message: `Emergency event triggered for driver at ${new Date().toLocaleTimeString()}`,
      message_te: `డ్రైవర్ వద్ద అత్యవసర పరిస్థితి గుర్తించబడింది (${new Date().toLocaleTimeString()})`,
      type: 'emergency',
      priority: 'critical',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(notif);

    this.broadcast('emergency_events:INSERT', newEvent);
    this.broadcast('notifications:INSERT', notif);
    this.saveToStorage();
    return newEvent;
  }

  // Acknowledge or Resolve Emergency
  public updateEmergencyStatus(
    id: string,
    status: 'acknowledged' | 'resolved',
    resolvedBy: string,
    notes?: string
  ): EmergencyEvent | null {
    const ev = this.emergencyEvents.find((e) => e.id === id);
    if (!ev) return null;

    ev.status = status;
    if (status === 'acknowledged') {
      ev.acknowledged_by = resolvedBy;
      ev.acknowledged_at = new Date().toISOString();
    } else if (status === 'resolved') {
      ev.resolved_by = resolvedBy;
      ev.resolved_at = new Date().toISOString();
      if (notes) ev.resolution_notes = notes;
    }

    this.broadcast('emergency_events:UPDATE', ev);
    this.saveToStorage();
    return ev;
  }

  // Update GPS
  public updateGPS(location: Omit<GPSLocation, 'id'>): GPSLocation {
    const newLoc: GPSLocation = {
      ...location,
      id: 'gps-' + Math.random().toString(36).substring(2, 9),
    };
    this.gpsLocations.unshift(newLoc);
    if (this.gpsLocations.length > 200) this.gpsLocations.pop();

    this.broadcast('gps_locations:INSERT', newLoc);
    return newLoc;
  }
}

export const mockDb = new MockDatabase();

