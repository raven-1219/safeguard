// ==============================================================================
// SAFE GUARD AI - Core TypeScript Definitions
// Matches all 12 database tables, AI telemetry, and role authentication models
// ==============================================================================

export type UserRole = 'driver' | 'moderator' | 'admin';

export type DriverSafetyState = 'ALERT' | 'DROWSY' | 'HIGHLY DROWSY';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type EmergencyEventStatus = 'active' | 'acknowledged' | 'resolved';

export type VehicleStatus = 'active' | 'maintenance' | 'inactive';

// 1. User Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  preferred_language: 'en' | 'te';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 2. Moderator Group
export interface ModeratorGroup {
  id: string;
  name: string;
  description?: string;
  moderator_id: string;
  max_drivers: number;
  created_at: string;
  updated_at: string;
}

// 3. Group Member (Driver assigned to Moderator)
export interface GroupMember {
  id: string;
  group_id: string;
  driver_id: string;
  assigned_at: string;
  driver?: Profile;
}

// 4. Vehicle
export interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  status: VehicleStatus;
  device_serial?: string;
  current_odometer_km: number;
  created_at: string;
  updated_at: string;
}

// 5. Vehicle Assignment
export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  driver_id: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  assigned_by?: string;
  created_at?: string;
  vehicle?: Vehicle;
  driver?: Profile;
}

// 6. Trip
export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  route_name: string;
  start_location: string;
  end_location?: string;
  start_time: string;
  end_time?: string;
  status: TripStatus;
  total_distance_km: number;
  average_speed_kmh: number;
  final_safety_score: number;
  created_at: string;
  driver?: Profile;
  vehicle?: Vehicle;
}

// 7. Monitoring Event (Real-time AI telemetry)
export interface MonitoringEvent {
  id: string;
  trip_id?: string;
  driver_id: string;
  event_type: 'DROWSY' | 'HIGHLY_DROWSY' | 'YAWN' | 'DISTRACTED' | 'SEATBELT_UNBUCKLED' | 'EYE_CLOSED';
  safety_state: DriverSafetyState;
  severity: EventSeverity;
  ear_value?: number;
  mar_value?: number;
  pitch_angle?: number;
  yaw_angle?: number;
  cnn_confidence?: number;
  seat_belt_detected: boolean;
  timestamp: string;
  metadata?: Record<string, any>;
  driver_name?: string;
  plate_number?: string;
}

// 8. Emergency Event
export interface EmergencyEvent {
  id: string;
  trip_id?: string;
  driver_id: string;
  event_type: 'suspected_collapse' | 'abnormal_motion' | 'prolonged_inactivity' | 'cardiac_alert';
  severity: EventSeverity;
  status: EmergencyEventStatus;
  trigger_source: string;
  description: string;
  latitude?: number;
  longitude?: number;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  timestamp: string;
  driver?: Profile;
  trip?: Trip;
}

// 9. GPS Location
export interface GPSLocation {
  id: string;
  trip_id?: string;
  vehicle_id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading: number;
  accuracy_meters: number;
  timestamp: string;
}

// 10. Safety Report
export interface SafetyReport {
  id: string;
  trip_id?: string;
  driver_id: string;
  overall_score: number;
  total_drowsy_events: number;
  total_highly_drowsy_events: number;
  total_distraction_events: number;
  total_seatbelt_warnings: number;
  total_emergency_events: number;
  trip_duration_minutes: number;
  distance_covered_km: number;
  summary_notes?: string;
  generated_at: string;
  driver?: Profile;
}

// 11. Notification
export interface AppNotification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  title_te?: string;
  message: string;
  message_te?: string;
  type: 'alert' | 'emergency' | 'warning' | 'info';
  priority: EventSeverity;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// 12. Audit Log
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
  user?: Profile;
}

// Realtime AI Pipeline Telemetry Payload
export interface LiveAITelemetry {
  ear: number;
  mar: number;
  pitch: number;
  yaw: number;
  roll: number;
  isEyesClosed: boolean;
  isYawning: boolean;
  isDistracted: boolean;
  blinkCount: number;
  cnnDrowsinessProb: number;
  seatBeltStatus: 'FASTENED' | 'UNFASTENED' | 'UNKNOWN';
  seatBeltFastened: boolean;
  safetyScore: number; // 0 - 100
  state: DriverSafetyState;
  lowLightEnhanced: boolean;
  timestamp: number;
}

// Pose / Health Emergency Telemetry (100% Webcam-derived)
export interface PoseEmergencyTelemetry {
  isAbnormalMotion: boolean;
  isSuspectedCollapse: boolean;
  isProlongedInactivity: boolean;
  motionVelocity: number;
  headDropDegrees: number;
  inactivitySeconds: number;
}
