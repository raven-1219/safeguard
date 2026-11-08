-- ==============================================================================
-- SAFE GUARD AI - Database Architecture & Row Level Security (RLS) Schema
-- Covers all 12 tables with constraints, indexes, triggers, and granular RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for strict data validation
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('driver', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_safety_state AS ENUM ('ALERT', 'DROWSY', 'HIGHLY DROWSY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE emergency_event_status AS ENUM ('active', 'acknowledged', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- TABLE 1: profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'driver',
    phone TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en', -- 'en' or 'te'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ==============================================================================
-- TABLE 2: moderator_groups
-- ==============================================================================
CREATE TABLE IF NOT EXISTS moderator_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    max_drivers INT NOT NULL DEFAULT 50 CHECK (max_drivers BETWEEN 10 AND 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mod_groups_moderator ON moderator_groups(moderator_id);

-- ==============================================================================
-- TABLE 3: group_members (Driver to Group assignment)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES moderator_groups(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_group_driver UNIQUE(group_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_driver ON group_members(driver_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);

-- ==============================================================================
-- TABLE 4: vehicles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    capacity INT DEFAULT 40,
    status vehicle_status NOT NULL DEFAULT 'active',
    device_serial VARCHAR(100) UNIQUE,
    current_odometer_km NUMERIC(10, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- ==============================================================================
-- TABLE 5: vehicle_assignments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vehicle_assign_active ON vehicle_assignments(vehicle_id, driver_id) WHERE is_active = true;

-- ==============================================================================
-- TABLE 6: trips
-- ==============================================================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    route_name VARCHAR(100) NOT NULL DEFAULT 'City Route A1',
    start_location VARCHAR(200) NOT NULL,
    end_location VARCHAR(200),
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ,
    status trip_status NOT NULL DEFAULT 'in_progress',
    total_distance_km NUMERIC(8, 2) DEFAULT 0.0,
    average_speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    final_safety_score NUMERIC(5, 2) DEFAULT 100.0 CHECK (final_safety_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- ==============================================================================
-- TABLE 7: monitoring_events (Real-time AI telemetry)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS monitoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'DROWSY', 'HIGHLY_DROWSY', 'YAWN', 'DISTRACTED', 'SEATBELT_UNBUCKLED'
    safety_state driver_safety_state NOT NULL DEFAULT 'ALERT',
    severity event_severity NOT NULL DEFAULT 'medium',
    ear_value NUMERIC(4, 3), -- Eye Aspect Ratio
    mar_value NUMERIC(4, 3), -- Mouth Aspect Ratio
    pitch_angle NUMERIC(5, 2), -- Head pose pitch
    yaw_angle NUMERIC(5, 2),   -- Head pose yaw
    cnn_confidence NUMERIC(4, 3), -- Drowsiness CNN probability
    seat_belt_detected BOOLEAN DEFAULT true,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_monitoring_trip ON monitoring_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_driver ON monitoring_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_time ON monitoring_events(timestamp DESC);

-- ==============================================================================
-- TABLE 8: emergency_events (Suspected Medical / Critical Safety)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'suspected_collapse', 'abnormal_motion', 'prolonged_inactivity', 'cardiac_alert'
    severity event_severity NOT NULL DEFAULT 'critical',
    status emergency_event_status NOT NULL DEFAULT 'active',
    trigger_source VARCHAR(50) NOT NULL DEFAULT 'mediapipe_pose', -- 'mediapipe_pose', 'simulated_ecg', 'driver_panic'
    description TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_emergency_driver ON emergency_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_emergency_time ON emergency_events(timestamp DESC);

-- ==============================================================================
-- TABLE 9: gps_locations (Vehicle GPS Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gps_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    heading NUMERIC(5, 2) DEFAULT 0.0,
    accuracy_meters NUMERIC(6, 2) DEFAULT 5.0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gps_trip ON gps_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_gps_vehicle ON gps_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_time ON gps_locations(timestamp DESC);

-- ==============================================================================
-- TABLE 10: safety_reports (Post-Trip & Aggregate Reports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS safety_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    total_drowsy_events INT DEFAULT 0,
    total_highly_drowsy_events INT DEFAULT 0,
    total_distraction_events INT DEFAULT 0,
    total_seatbelt_warnings INT DEFAULT 0,
    total_emergency_events INT DEFAULT 0,
    trip_duration_minutes INT DEFAULT 0,
    distance_covered_km NUMERIC(8, 2) DEFAULT 0.0,
    summary_notes TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_driver ON safety_reports(driver_id);
CREATE INDEX IF NOT EXISTS idx_reports_trip ON safety_reports(trip_id);

-- ==============================================================================
-- TABLE 11: notifications (Real-time Broadcast)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    title_te VARCHAR(150),
    message TEXT NOT NULL,
    message_te TEXT,
    type VARCHAR(30) NOT NULL DEFAULT 'alert', -- 'alert', 'emergency', 'warning', 'info'
    priority event_severity NOT NULL DEFAULT 'medium',
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(recipient_id) WHERE is_read = false;

-- ==============================================================================
-- TABLE 12: audit_logs (System Security & Compliance)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 12 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user role
CREATE OR REPLACE FUNCTION public.get_user_role() 
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Check if driver belongs to moderator's group
CREATE OR REPLACE FUNCTION public.is_moderator_for_driver(driver_uuid UUID) 
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM group_members gm
        JOIN moderator_groups mg ON gm.group_id = mg.id
        WHERE mg.moderator_id = auth.uid() AND gm.driver_id = driver_uuid
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS: profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins can manage all profiles"
    ON profiles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Moderators can view assigned drivers"
    ON profiles FOR SELECT
    USING (public.is_moderator_for_driver(id));

CREATE POLICY "Users can update their own preferred language"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- RLS: moderator_groups & group_members
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins manage groups"
    ON moderator_groups FOR ALL
    USING (public.is_admin());

CREATE POLICY "Moderators view own group"
    ON moderator_groups FOR SELECT
    USING (moderator_id = auth.uid());

CREATE POLICY "Admins manage group members"
    ON group_members FOR ALL
    USING (public.is_admin());

CREATE POLICY "Moderators view own group members"
    ON group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM moderator_groups mg 
            WHERE mg.id = group_members.group_id AND mg.moderator_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- RLS: vehicles & vehicle_assignments
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins manage vehicles"
    ON vehicles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users view active vehicles"
    ON vehicles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins manage vehicle assignments"
    ON vehicle_assignments FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers view own assignments"
    ON vehicle_assignments FOR SELECT
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view assigned driver assignments"
    ON vehicle_assignments FOR SELECT
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: trips
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins view and manage all trips"
    ON trips FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers manage their own trips"
    ON trips FOR ALL
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view assigned driver trips"
    ON trips FOR SELECT
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: monitoring_events
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins view all monitoring events"
    ON monitoring_events FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers insert and view own events"
    ON monitoring_events FOR ALL
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view assigned driver monitoring events"
    ON monitoring_events FOR SELECT
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: emergency_events
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins full access to emergency events"
    ON emergency_events FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers insert and view own emergencies"
    ON emergency_events FOR ALL
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view and acknowledge assigned emergencies"
    ON emergency_events FOR ALL
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: gps_locations
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins view all GPS locations"
    ON gps_locations FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers insert own GPS"
    ON gps_locations FOR ALL
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view assigned driver GPS"
    ON gps_locations FOR SELECT
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: safety_reports
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins manage all safety reports"
    ON safety_reports FOR ALL
    USING (public.is_admin());

CREATE POLICY "Drivers view own safety reports"
    ON safety_reports FOR SELECT
    USING (driver_id = auth.uid());

CREATE POLICY "Moderators view assigned driver safety reports"
    ON safety_reports FOR SELECT
    USING (public.is_moderator_for_driver(driver_id));

-- ------------------------------------------------------------------------------
-- RLS: notifications
-- ------------------------------------------------------------------------------
CREATE POLICY "Users view and update own notifications"
    ON notifications FOR ALL
    USING (recipient_id = auth.uid());

CREATE POLICY "Admins manage notifications"
    ON notifications FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: audit_logs
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins view audit logs"
    ON audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "System insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

